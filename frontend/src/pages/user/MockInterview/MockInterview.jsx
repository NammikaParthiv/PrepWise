import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../../utils/axios.js";

function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [queNo, setQueNo] = useState(1);
  const [allAnswers, setAllAnswers] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Timers & Phases: "reading" (30s) -> "answering" (120s / 2 mins)
  const [phase, setPhase] = useState("reading"); 
  const [timeLeft, setTimeLeft] = useState(30);

  // Transcription, Speech metrics (pauses/lag), & Media Refs
  const [currentTranscript, setCurrentTranscript] = useState("");
  const speechMetricsRef = useRef({ wordTimestamps: [], lastWordTime: null, longPausesCount: 0 });
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [stream, setStream] = useState(null);

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
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Start Speech Recognition & Tracking Speech Lag / Pauses
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setCurrentTranscript(""); 
    speechMetricsRef.current = { wordTimestamps: [], lastWordTime: Date.now(), longPausesCount: 0 };

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false; 
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const now = Date.now();
      let textChunk = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const phrase = event.results[i][0].transcript.trim();
          textChunk += phrase + " ";

          const lastTime = speechMetricsRef.current.lastWordTime;
          if (lastTime) {
            const gapSeconds = (now - lastTime) / 1000;
            if (gapSeconds > 3.5) {
              speechMetricsRef.current.longPausesCount += 1;
            }
          }
          speechMetricsRef.current.lastWordTime = now;
        }
      }
      setCurrentTranscript((prev) => prev + textChunk);
    };

    recognition.start();
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(() => {
    recordedChunksRef.current = [];
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      startSpeechRecognition(); 
    } catch (error) {
      console.error("Error starting media recorder:", error);
    }
  }, [stream, startSpeechRecognition]);

  const stopRecordingHelper = useCallback(() => {
    return new Promise((resolve) => {
      stopSpeechRecognition(); 
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }, [stopSpeechRecognition]);

  const completeInterview = useCallback(async (finalAnswers) => {
    setIsAnalyzing(true);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    try {
      const res = await axios.post("/api/interview/submit", {
        interviewId: interview._id,
        answers: finalAnswers,
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
  }, [stream, interview, navigate]);

  const nextQuestion = useCallback(async () => {
    let videoBlob = null;
    if (phase === "answering") {
      videoBlob = await stopRecordingHelper();
    }

    const updatedAnswers = [...allAnswers];
    updatedAnswers[queNo - 1] = {
      question: questions[queNo - 1]?.question || "",
      transcript: currentTranscript, 
      longPausesDetected: speechMetricsRef.current.longPausesCount,
      videoBlob: videoBlob,
    };
    setAllAnswers(updatedAnswers);

    if (queNo < questions.length) {
      setQueNo((prev) => prev + 1);
      setPhase("reading");
      setTimeLeft(30);
    } else {
      completeInterview(updatedAnswers);
    }
  }, [phase, allAnswers, queNo, questions, currentTranscript, stopRecordingHelper, completeInterview]);

  // Main Timer Effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      queueMicrotask(() => {
        if (phase === "reading") {
          setPhase("answering");
          setTimeLeft(120);
          startRecording();
        } else if (phase === "answering") {
          nextQuestion();
        }
      });
    }
  }, [timeLeft, phase, startRecording, nextQuestion]);

  if (!interview) {
    navigate("/u/interview_simulator");
    return null;
  }

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
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
      {/* Top Header Navigation */}
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

      {/* Progress Bar */}
      <div className="bg-slate-200 dark:bg-slate-800 h-2.5 sm:h-3 rounded-lg mb-6 shadow-inner">
        <div className="bg-emerald-500 h-2.5 sm:h-3 rounded-lg transition-all duration-500" style={{ width: `${(queNo / questions.length) * 100}%` }} />
      </div>

      {/* Main Grid Container */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 rounded-2xl shadow-2xl p-4 sm:p-8 border ${colors.card}`}>
        
        {/* Left Side: Question and Controls */}
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

          <div className="p-3 sm:p-4 rounded-xl border border-dashed border-slate-700 text-center">
            {phase === "reading" ? (
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Read carefully. Recording starts automatically in {timeLeft} seconds.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-emerald-400 font-semibold">
                Your response is being tracked for fluency and pauses. Speak clearly!
              </p>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={nextQuestion}
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

        {/* Right Side: Webcam Video Feed */}
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