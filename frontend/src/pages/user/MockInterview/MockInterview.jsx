import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../../utils/axios.js";

function MockInterview() {
  // TEMP DEBUG — remove once you've confirmed the fix in your own devtools.
  // Open the browser console and watch for these tags while doing a full
  // question cycle. You should see:
  //   [MockInterview] recognition.start() called   -> exactly ONCE per question
  //     (unless Chrome itself times out mid-answer, which is a browser-level
  //      restart, not a bug — you'll see the log fire again if that happens)
  //   [MockInterview] nextQuestion() invoked        -> exactly ONCE per question
  //   [MockInterview] nextQuestion() GUARDED        -> should NEVER appear;
  //     if it does, it means a double-call was attempted and successfully
  //     blocked (which is fine), but tells you something upstream is still
  //     re-triggering more than expected.
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log("[MockInterview]", ...args);

  const navigate = useNavigate();
  const location = useLocation();
  const [queNo, setQueNo] = useState(1);
  const [allAnswers, setAllAnswers] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Timers & Phases: "reading" (30s) -> "answering" (120s / 2 mins)
  const [phase, setPhase] = useState("reading");
  const [timeLeft, setTimeLeft] = useState(30);

  // Transcription State & Refs
  const [currentTranscript, setCurrentTranscript] = useState("");
  const accumulatedTranscriptRef = useRef(""); // Everything said across auto-restarts, for THIS question
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [stream, setStream] = useState(null);

  // isAnsweringRef: true while we WANT recognition running (intentional restarts allowed).
  // Setting it false is how we signal "stop for real" to the onend handler.
  const isAnsweringRef = useRef(false);
  // Resolves the in-flight stopSpeechRecognition() promise once onend fires
  // AFTER isAnsweringRef has been flipped to false (i.e. a real, final stop).
  const stopResolverRef = useRef(null);
  // Guards against calling recognition.start() while an instance is still active,
  // which throws "already started" and can desync the restart loop.
  const isRecognitionRunningRef = useRef(false);

  const interview = location.state?.interview;
  const questions = interview?.questions || [];

  // 1. Initialize Webcam & Microphone on mount
  useEffect(() => {
    let mediaStream = null;
    async function setupCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing webcam/microphone:", error);
        alert("Camera and Microphone permissions are required to take this mock interview.");
      }
    }
    setupCamera();

    return () => {
      isAnsweringRef.current = false;
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // 2. Speech Recognition Engine — restarts through pauses/silence, stops only
  // when explicitly told to via stopSpeechRecognition().
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser. Use Chrome, or fall back to server-side transcription.");
      return;
    }

    isAnsweringRef.current = true;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isRecognitionRunningRef.current = true;
    };

    recognition.onresult = (event) => {
      let interimText = "";
      let newFinalText = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalText += piece + " ";
        } else {
          interimText += piece;
        }
      }

      if (newFinalText) {
        accumulatedTranscriptRef.current += newFinalText;
      }

      // Show everything finalized so far + whatever is being said live right now
      setCurrentTranscript(accumulatedTranscriptRef.current + interimText);
    };

    recognition.onerror = (event) => {
      // "no-speech" fires often during natural pauses — harmless, recognition
      // will auto-restart via onend below. These are the genuinely fatal ones:
      const fatalErrors = ["not-allowed", "audio-capture", "service-not-allowed"];
      if (fatalErrors.includes(event.error)) {
        console.error("Fatal speech recognition error, stopping restarts:", event.error);
        isAnsweringRef.current = false;
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("Speech recognition warning:", event.error);
      }
    };

    recognition.onend = () => {
      isRecognitionRunningRef.current = false;

      if (isAnsweringRef.current) {
        // Not an intentional stop — browser timed the session out (common after
        // ~60s of silence in some Chrome builds) or auto-restarted. Bring it back
        // immediately so we never lose speech mid-answer.
        try {
          recognition.start();
          log("recognition.start() called — RESTART (Chrome ended the previous session on its own, not a code bug)");
        } catch (e) {
          // Rapid restart got throttled — retry shortly.
          setTimeout(() => {
            if (isAnsweringRef.current && recognitionRef.current && !isRecognitionRunningRef.current) {
              try {
                recognitionRef.current.start();
                log("recognition.start() called — delayed RESTART");
              } catch (err) {}
            }
          }, 300);
        }
      } else if (stopResolverRef.current) {
        // This is a real, final stop — the transcript is now guaranteed complete.
        const resolve = stopResolverRef.current;
        stopResolverRef.current = null;
        resolve();
      }
    };

    try {
      recognition.start();
      log("recognition.start() called");
    } catch (err) {
      console.error("Failed to start speech recognition instance:", err);
    }
  }, []);

  // Stops recognition and resolves only once onend confirms it actually ended —
  // so callers never read the transcript before the last words are finalized.
  const stopSpeechRecognition = useCallback(() => {
    return new Promise((resolve) => {
      isAnsweringRef.current = false;

      if (recognitionRef.current && isRecognitionRunningRef.current) {
        stopResolverRef.current = resolve;
        try {
          recognitionRef.current.stop();
        } catch (e) {
          stopResolverRef.current = null;
          resolve();
        }
      } else {
        resolve();
      }
    });
  }, []);

  const startRecording = useCallback(() => {
    recordedChunksRef.current = [];
    accumulatedTranscriptRef.current = "";
    setCurrentTranscript("");

    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      startSpeechRecognition();
    } catch (error) {
      console.error("Error starting media recorder:", error);
    }
  }, [stream, startSpeechRecognition]);

  const stopRecordingHelper = useCallback(async () => {
    // Wait for recognition to fully, finally stop BEFORE touching the transcript
    // or stopping the video — this is what fixes the empty/truncated answers.
    await stopSpeechRecognition();

    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      return null;
    }

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        resolve(blob);
      };
      try {
        mediaRecorder.stop();
      } catch (e) {
        resolve(null);
      }
    });
  }, [stopSpeechRecognition]);

  const completeInterview = useCallback(
    async (finalAnswers) => {
      setIsAnalyzing(true);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      try {
        // videoBlob objects can't survive JSON.stringify (a Blob serializes to
        // "{}"), so this must go as multipart/form-data, not a JSON body.
        const formData = new FormData();
        formData.append("interviewId", interview._id);

        finalAnswers.forEach((answer, index) => {
          formData.append(`answers[${index}][question]`, answer.question);
          formData.append(`answers[${index}][transcript]`, answer.transcript);
          formData.append(`answers[${index}][longPausesDetected]`, answer.longPausesDetected);
          if (answer.videoBlob) {
            formData.append(`answers[${index}][video]`, answer.videoBlob, `question_${index + 1}.webm`);
          }
        });

        const res = await axios.post("/api/interview/submit", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        navigate("/u/interview_simulator/result", {
          replace: true,
          state: { interview: res.data.interview },
        });
      } catch (error) {
        console.log(error);
        alert(error.response?.data?.msg || "Failed to submit interview");
        setIsAnalyzing(false);
      }
    },
    [stream, interview, navigate]
  );

  // Guards against nextQuestion running twice concurrently for the same
  // question — belt-and-suspenders on top of the effect fix below.
  const isAdvancingRef = useRef(false);

  const nextQuestion = useCallback(async () => {
    if (isAdvancingRef.current) {
      log("nextQuestion() GUARDED — a duplicate call was blocked");
      return;
    }
    isAdvancingRef.current = true;
    log("nextQuestion() invoked");

    try {
      let videoBlob = null;
      let finalAnswerText = "";

      if (phase === "answering") {
        videoBlob = await stopRecordingHelper();
        // Recognition has now fully stopped and flushed its last result into
        // accumulatedTranscriptRef — safe to read it here.
        finalAnswerText = accumulatedTranscriptRef.current.trim();
      }

      const updatedAnswers = [...allAnswers];
      updatedAnswers[queNo - 1] = {
        question: questions[queNo - 1]?.question || "",
        transcript: finalAnswerText || "[No clear speech detected]",
        longPausesDetected: 0,
        videoBlob: videoBlob,
      };
      setAllAnswers(updatedAnswers);

      // Reset transcript storage for the next question
      accumulatedTranscriptRef.current = "";
      setCurrentTranscript("");

      if (queNo < questions.length) {
        setQueNo((prev) => prev + 1);
        setPhase("reading");
        setTimeLeft(30);
        isAdvancingRef.current = false; // free the guard for the next question
      } else {
        await completeInterview(updatedAnswers);
        isAdvancingRef.current = false;
      }
    } catch (e) {
      isAdvancingRef.current = false;
      throw e;
    }
  }, [phase, allAnswers, queNo, questions, stopRecordingHelper, completeInterview]);

  // Keep refs pointed at the latest versions of these callbacks WITHOUT making
  // the timer effect depend on them directly. nextQuestion's identity changes
  // every time allAnswers/queNo update (it closes over them) — if the timer
  // effect depended on nextQuestion itself, that identity change alone would
  // re-trigger the effect even though timeLeft/phase hadn't actually changed,
  // causing nextQuestion (and therefore submission) to fire twice. Same logic
  // applies to startRecording, to avoid ever double-starting recognition.
  const nextQuestionRef = useRef(nextQuestion);
  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  }, [nextQuestion]);

  const startRecordingRef = useRef(startRecording);
  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  // Main Timer Effect — depends ONLY on values that should genuinely restart
  // the countdown or trigger a phase transition.
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (phase === "reading") {
      setPhase("answering");
      setTimeLeft(120);
      startRecordingRef.current();
    } else if (phase === "answering") {
      nextQuestionRef.current();
    }
  }, [timeLeft, phase]);

  if (!interview) {
    navigate("/u/interview_simulator");
    return null;
  }

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
      isAnsweringRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      navigate("/u/interview_simulator");
    }
  };

  const colors = {
    bg: isDarkMode ? "bg-slate-950" : "bg-amber-50",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    card: isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-amber-200",
    buttonBg: isDarkMode ? "bg-slate-800" : "bg-amber-200",
    accent: isDarkMode ? "text-emerald-400" : "text-emerald-700",
  };

  if (isAnalyzing) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 ${colors.bg} ${colors.text}`}>
        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-4 border-emerald-500 mb-6"></div>
        <h1 className="text-2xl sm:text-4xl font-black text-center">Analyzing your answers...</h1>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={`min-h-screen pb-10 ${colors.bg} ${colors.text} transition-colors duration-500 pt-4 sm:pt-6 px-4 sm:px-10`}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 cursor-pointer ${colors.buttonBg}`}
        >
          {isDarkMode ? "☀ Light" : "🌙 Dark"}
        </button>
        <div className="text-xs sm:text-sm font-semibold opacity-70 text-center truncate max-w-[200px] sm:max-w-none">
          Role: {interview.job_role}
        </div>
        <button
          onClick={handleExit}
          className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm text-slate-500 border border-slate-300 hover:bg-slate-200 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          Exit ❌
        </button>
      </div>

      <div className="bg-slate-200 dark:bg-slate-800 h-2.5 sm:h-3 rounded-lg mb-6 shadow-inner">
        <div
          className="bg-emerald-500 h-2.5 sm:h-3 rounded-lg transition-all duration-500"
          style={{ width: `${(queNo / questions.length) * 100}%` }}
        />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 rounded-2xl shadow-2xl p-4 sm:p-8 border ${colors.card}`}>
        <div className="flex flex-col justify-between space-y-6 order-2 lg:order-1">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <span className={`text-base sm:text-lg font-bold ${colors.accent}`}>
                Question {queNo} of {questions.length}
              </span>

              {phase === "reading" ? (
                <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                  ⏳ Reading: {timeLeft}s
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  🔴 Recording: {formatTime(timeLeft)}
                </span>
              )}
            </div>

            <div className={`rounded-xl p-5 sm:p-8 border ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-amber-100/60 border-amber-200"}`}>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-relaxed">
                Q{queNo}) {questions[queNo - 1]?.question}
              </h2>
            </div>
          </div>

          {/* Live Transcript Feedback Box */}
          <div className="p-3 sm:p-4 rounded-xl border border-slate-700 bg-slate-900/50 max-h-36 overflow-y-auto">
            <p className="text-xs text-slate-400 font-semibold mb-1">Your Spoken Answer (Live):</p>
            <p className="text-sm text-emerald-300 italic whitespace-pre-wrap">
              {currentTranscript ? currentTranscript : "(Listening... speak your answer clearly)"}
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => nextQuestion()}
              disabled={phase === "reading" || isAdvancingRef.current}
              className={`w-full text-white text-lg sm:text-xl py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                phase === "reading"
                  ? "bg-slate-700 opacity-50 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] cursor-pointer"
              }`}
            >
              {phase === "reading" ? "Reading Question..." : queNo < questions.length ? "Finish Answer & Next" : "Submit Interview"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800 relative overflow-hidden h-[300px] sm:min-h-[400px] order-1 lg:order-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg shadow-inner transform -scale-x-100"
          />

          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${phase === "answering" ? "bg-red-500 animate-ping" : "bg-amber-400"}`} />
            <span className="text-[10px] sm:text-xs font-bold text-white tracking-wider">
              {phase === "answering" ? "REC" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockInterview;