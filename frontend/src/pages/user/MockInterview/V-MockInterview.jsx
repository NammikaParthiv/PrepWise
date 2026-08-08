import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../../utils/axios.js";

function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();

  const [queNo, setQueNo] = useState(1);
  // Tracked as a ref, not state — this array is never rendered directly
  // (only transcriptionStatuses drives the UI), and finishInterview needs
  // to read the truly-current value after awaiting all transcriptions.
  // A state-based closure would still hold whatever allAnswers looked like
  // when this render's finishInterview was created, even after awaiting —
  // React state updates don't retroactively change an already-captured
  // variable. A ref sidesteps that entirely since .current is always live.
  const allAnswersRef = useRef([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // "reading" (30s) -> "answering" (120s)
  const [phase, setPhase] = useState("reading");
  const [timeLeft, setTimeLeft] = useState(30);

  // Per-question background transcription status, purely for a quiet UI
  // indicator — never gates navigation for earlier questions; only the
  // final "wait for everything" step in finishInterview reads it to decide
  // what message to show.
  // idle | recording | processing | done | error
  const [transcriptionStatuses, setTranscriptionStatuses] = useState([]);

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const audioStreamRef = useRef(null); // audio-only tracks, for MediaRecorder

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // One in-flight-upload promise per question index — awaited in bulk only
  // inside finishInterview, never during normal navigation between
  // questions.
  const pendingUploadsRef = useRef([]);
  const isAdvancingRef = useRef(false);

  const interview = location.state?.interview;
  // Memoized so this array has a stable identity across renders — without
  // this, every callback that depends on `questions` (nextQuestion,
  // uploadAudioForTranscription) would be recreated on every render, since
  // `interview?.questions || []` produces a brand-new array each time.
  const questions = useMemo(() => interview?.questions || [], [interview]);

  // 1. Webcam (for the candidate to see themselves) + mic. We split the mic
  // track off into its own MediaStream so MediaRecorder captures audio only.
  useEffect(() => {
    let mediaStream = null;
    async function setupCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        audioStreamRef.current = new MediaStream(mediaStream.getAudioTracks());
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
      if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.log(err);
        }
      }
    };
  }, []);

  // 2. Start recording audio for the current question.
  const startRecording = useCallback(() => {
    if (!audioStreamRef.current) return;

    audioChunksRef.current = [];
    const recorder = new MediaRecorder(audioStreamRef.current, { mimeType: "audio/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();

    setTranscriptionStatuses((prev) => {
      const copy = [...prev];
      copy[queNo - 1] = "recording";
      return copy;
    });
  }, [queNo]);

  // 3. Upload one answer's audio. Registers a promise in pendingUploadsRef
  // immediately (synchronously, before any await), so finishInterview can
  // always find and await it later — even if it's called moments after
  // this function starts running.
  const uploadAudioForTranscription = useCallback(
    (blob, index) => {
      const promise = (async () => {
        try {
          const formData = new FormData();
          formData.append("audio", blob, `answer-${index + 1}.webm`);
          formData.append("questionIndex", String(index));

          const res = await axios.post("/api/interview/transcribe", formData, {
            headers: { "Content-Type": undefined },
          });

          const text = res.data?.text?.trim() || "[No clear speech detected]";

          // Direct, synchronous mutation — no closure staleness possible.
          allAnswersRef.current[index] = { question: questions[index]?.question || "", answer: text };
          setTranscriptionStatuses((prev) => {
            const copy = [...prev];
            copy[index] = "done";
            return copy;
          });
        } catch (err) {
          console.error(`Transcription failed for question ${index + 1}:`, err);
          allAnswersRef.current[index] = { question: questions[index]?.question || "", answer: "[Transcription failed]" };
          setTranscriptionStatuses((prev) => {
            const copy = [...prev];
            copy[index] = "error";
            return copy;
          });
        }
      })();

      pendingUploadsRef.current[index] = promise;
    },
    [questions]
  );

  // 4. Stop recording for a given question index, then kick off its upload.
  // Resolves once the recorder has genuinely stopped and the upload promise
  // has been REGISTERED in pendingUploadsRef — NOT once transcription
  // itself finishes. For every question except the last, this resolves
  // almost instantly and the actual transcription keeps running quietly in
  // the background while the user reads/answers the next question.
  const stopRecordingAndUpload = useCallback(
    (index) => {
      return new Promise((resolve) => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") {
          resolve();
          return;
        }

        setTranscriptionStatuses((prev) => {
          const copy = [...prev];
          copy[index] = "processing";
          return copy;
        });

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          audioChunksRef.current = [];
          uploadAudioForTranscription(blob, index);
          resolve();
        };

        recorder.stop();
      });
    },
    [uploadAudioForTranscription]
  );

  // 5. Wait for EVERY question's transcription to genuinely finish, THEN
  // submit for Gemini evaluation, THEN navigate to the result page. Nothing
  // is shown to the user until all of this completes — declared BEFORE
  // nextQuestion since nextQuestion calls it via a ref (see below), and to
  // keep the file's read order matching the actual call order.
  const finishInterview = useCallback(async () => {
    setIsAnalyzing(true);
    if (stream) stream.getTracks().forEach((track) => track.stop());

    try {
      // Waits for every registered upload/transcription — including the
      // last question's, now guaranteed to be registered by nextQuestion
      // awaiting stopRecordingAndUpload before calling this.
      await Promise.allSettled(pendingUploadsRef.current.filter(Boolean));

      // Build the payload from the ref, not from any closed-over state —
      // this is guaranteed to reflect every transcription that just
      // finished during the await above, including the last question's.
      const finalAnswers = questions.map((_, index) => allAnswersRef.current[index]);

      const res = await axios.post("/api/interview/submit", {
        interviewId: interview._id,
        answers: finalAnswers.map((a) => ({ answer: a?.answer || "[No clear speech detected]" })),
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
  }, [stream, interview, questions, navigate]);

  // Ref so nextQuestion always calls the freshest finishInterview (latest
  // allAnswers/interview closure) without needing to list it as a
  // useCallback dependency — same pattern used for nextQuestionRef below.
  const finishInterviewRef = useRef(finishInterview);
  useEffect(() => {
    finishInterviewRef.current = finishInterview;
  }, [finishInterview]);

  // 6. Advance to the next question, or finish. Awaits only the brief
  // stop-and-register step from stopRecordingAndUpload — actual
  // transcription keeps running in the background for every question
  // except the last, where finishInterview will properly wait for it.
  const nextQuestion = useCallback(async () => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    const currentIndex = queNo - 1;
    if (phase === "answering") {
      await stopRecordingAndUpload(currentIndex);
    }

    if (queNo < questions.length) {
      setQueNo((prev) => prev + 1);
      setPhase("reading");
      setTimeLeft(30);
      isAdvancingRef.current = false;
    } else {
      finishInterviewRef.current();
      isAdvancingRef.current = false;
    }
  }, [phase, queNo, questions, stopRecordingAndUpload]);

  const nextQuestionRef = useRef(nextQuestion);
  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  }, [nextQuestion]);

  const startRecordingRef = useRef(startRecording);
  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  // Timer — only depends on values that should restart the countdown.
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.log(err);
        }
      }
      if (stream) stream.getTracks().forEach((track) => track.stop());
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
    const stillProcessing = transcriptionStatuses.filter((s) => s === "processing").length;
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 ${colors.bg} ${colors.text}`}>
        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-4 border-emerald-500 mb-6"></div>
        <h1 className="text-2xl sm:text-4xl font-black text-center">
          {stillProcessing > 0 ? "Finishing up your last answer..." : "Analyzing your answers..."}
        </h1>
        <p className="text-sm text-slate-400 mt-2">This may take a minute or two.</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const statusDot = (status) => {
    switch (status) {
      case "recording":
        return <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" title="Recording" />;
      case "processing":
        return <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" title="Transcribing in background" />;
      case "done":
        return <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Transcribed" />;
      case "error":
        return <span className="h-1.5 w-1.5 rounded-full bg-red-600" title="Transcription failed" />;
      default:
        return <span className="h-1.5 w-1.5 rounded-full bg-slate-600" title="Not answered yet" />;
    }
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
        <div className="text-xs sm:text-sm font-semibold opacity-70 text-center truncate max-w-50 sm:max-w-none">
          Role: {interview.job_role}
        </div>
        <button
          onClick={handleExit}
          className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm text-slate-500 border border-slate-300 hover:bg-slate-200 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          Exit ❌
        </button>
      </div>

      <div className="bg-slate-200 dark:bg-slate-800 h-2.5 sm:h-3 rounded-lg mb-2 shadow-inner">
        <div
          className="bg-emerald-500 h-2.5 sm:h-3 rounded-lg transition-all duration-500"
          style={{ width: `${(queNo / questions.length) * 100}%` }}
        />
      </div>

      {/* Quiet per-question background status strip */}
      <div className="flex items-center gap-1.5 mb-6 px-1">
        {questions.map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {statusDot(transcriptionStatuses[i])}
          </div>
        ))}
        {transcriptionStatuses.some((s) => s === "processing") && (
          <span className="text-[10px] text-amber-400 ml-2">Transcribing previous answer in background…</span>
        )}
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

          <div className="p-4 sm:p-5 rounded-xl border border-slate-700 bg-slate-900/50 flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full shrink-0 ${
                phase === "answering" ? "bg-rose-500 animate-pulse" : "bg-slate-600"
              }`}
            />
            <p className="text-sm text-slate-300">
              {phase === "answering"
                ? "Recording your voice — just speak naturally. Nothing is sent until you move on."
                : "Recording will start automatically once the reading timer ends."}
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => nextQuestion()}
              disabled={phase === "reading"}
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

        <div className="flex flex-col items-center justify-center bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800 relative overflow-hidden h-75 sm:min-h-100 order-1 lg:order-2">
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