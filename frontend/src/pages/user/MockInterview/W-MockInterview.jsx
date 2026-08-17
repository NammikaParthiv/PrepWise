import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../utils/axios.js";

function WMockInterview() {
  const location = useLocation();
  const navigate = useNavigate();

  const interviewData = location.state?.interview;

  const [darkMode, setDarkMode] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!interviewData || !interviewData.questions) {
      alert("No active interview session found. Redirecting to simulator.");
      navigate("/u/interview_simulator", { replace: true });
    }
  }, [interviewData, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  if (!interviewData || !interviewData.questions) {
    return null;
  }

  const questions = interviewData.questions;
  const currentQuestion = questions[currentIndex];

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleTextChange = (e) => {
    setAnswers({
      ...answers,
      [currentIndex]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSeconds(0);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmitInterview = async () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your written interview?"
    );
    if (!confirmSubmit) return;

    try {
      setSubmitting(true);
      const formattedAnswers = questions.map((q, idx) => ({
        questionId: q._id || idx,
        answer: answers[idx] || "",
      }));

      const res = await axios.post("/api/interview/submit", {
        interviewId: interviewData._id,
        answers: formattedAnswers,
      });

      navigate("/u/interview_simulator/result", {
        replace: true,
        state: { interview: res.data.interview, result: res.data, interviewId: interviewData._id },
      });
    } catch (error) {
      console.error(error);
      if (error.response?.status === 503) {
        alert("The server is busy. Please try later.");
      } else {
        alert(error.response?.data?.msg || "Failed to submit interview.");
      }
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 flex flex-col justify-center items-center p-6 ${
          darkMode
            ? "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-100"
            : "bg-slate-100 text-slate-900"
        }`}
      >
        <div
          className={`border-2 shadow-2xl rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center ${
            darkMode
              ? "bg-slate-900/90 border-slate-800 backdrop-blur-md"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="relative flex items-center justify-center mb-6">
            <div
              className={`w-16 h-16 border-4 rounded-full ${
                darkMode ? "border-indigo-950" : "border-indigo-200"
              }`}
            ></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute"></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Analysing your answers...
          </h2>
          <p className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            This may take some time... Please do not refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col justify-between p-4 sm:p-8 ${
        darkMode
          ? "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-100"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <span className="bg-indigo-600 text-white font-bold px-3.5 py-1 rounded-full text-sm shadow-sm">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span
            className={`text-sm hidden sm:inline font-medium ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Role:{" "}
            <strong
              className={`capitalize ${
                darkMode ? "text-slate-200" : "text-slate-700"
              }`}
            >
              {interviewData.job_role || "Developer"}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 border px-3.5 py-1.5 rounded-full shadow-sm ${
              darkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span
              className={`text-xs font-semibold tracking-wider uppercase ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Time:
            </span>
            <span
              className={`text-sm font-mono font-bold ${
                darkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              {formatTimer(seconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-full shadow-md border hover:scale-105 transition-transform cursor-pointer ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-white border-slate-300 text-slate-800"
            }`}
            title="Toggle Theme"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center">
        <div
          className={`border-2 shadow-2xl rounded-2xl p-6 sm:p-10 flex flex-col ${
            darkMode
              ? "bg-slate-900/90 border-slate-800 backdrop-blur-sm"
              : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`mb-6 pb-4 border-b ${
              darkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs uppercase tracking-wider text-indigo-500 font-bold">
                Written Assessment Question
              </h2>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-snug">
              {currentQuestion.question || currentQuestion.text}
            </h1>
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="answer-box"
                className={`text-sm font-semibold ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Your Written Answer:
              </label>
              <span className="text-xs font-mono text-slate-400">
                {(answers[currentIndex] || "").length} characters
              </span>
            </div>

            <textarea
              id="answer-box"
              rows="14"
              value={answers[currentIndex] || ""}
              onChange={handleTextChange}
              placeholder="Type your structured explanation, code breakdown, or answer details here..."
              className={`w-full min-h-[300px] lg:min-h-[420px] p-5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg sm:text-xl font-normal leading-relaxed resize-y shadow-inner transition-all ${
                darkMode
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
              }`}
            ></textarea>
          </div>

          <div
            className={`flex justify-end items-center mt-8 pt-6 border-t ${
              darkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div className="flex space-x-3">
              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg cursor-pointer transition-all"
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitInterview}
                  disabled={submitting}
                  className="px-8 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer transition-all"
                >
                  Finish & Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WMockInterview;
