import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../utils/axios.js";

function RMockInterview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve interview data passed from the simulator
  const interviewData = location.state?.interview;

  const [darkMode, setDarkMode] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Safety fallback if accessed directly without state
  useEffect(() => {
    if (!interviewData || !interviewData.questions) {
      alert("No active interview session found. Redirecting to simulator.");
      navigate("/u/interview_simulator", { replace: true });
    }
  }, [interviewData, navigate]);

  if (!interviewData || !interviewData.questions) {
    return null;
  }

  const questions = interviewData.questions;
  const currentQuestion = questions[currentIndex];

  const handleTextChange = (e) => {
    setAnswers({
      ...answers,
      [currentIndex]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitInterview = async () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your written interview?"
    );
    if (!confirmSubmit) return;

    try {
      setSubmitting(true);
      // Format answers for your backend API
      const formattedAnswers = questions.map((q, idx) => ({
        questionId: q._id || idx,
        answer: answers[idx] || "",
      }));

      await axios.post(`/api/interview/${interviewData._id}/submit`, {
        answers: formattedAnswers,
      });

      alert("Interview submitted successfully!");
      navigate("/u/interview_simulator", { replace: true });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.msg || "Failed to submit interview.");
      setSubmitting(false);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col justify-between p-4 sm:p-8">
        
        {/* Top Bar: Progress Indicator & Theme Toggle */}
        <header className="w-full max-w-4xl mx-auto flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
              Role: <strong className="capitalize">{interviewData.job_role || "Developer"}</strong>
            </span>
          </div>

          {/* Theme Toggle Button (Top Right) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-300 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer"
            title="Toggle Theme"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </header>

        {/* Main Exam Box */}
        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-10 flex flex-col">
            
            {/* Question Header Box */}
            <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs uppercase tracking-wider text-indigo-500 font-bold mb-1">
                Written Assessment Question
              </h2>
              <h1 className="text-xl sm:text-2xl font-bold leading-snug">
                {currentQuestion.question || currentQuestion.text}
              </h1>
            </div>

            {/* Big Text Box for Answering */}
            <div className="flex flex-col flex-1">
              <label 
                htmlFor="answer-box" 
                className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2"
              >
                Your Written Answer:
              </label>
              <textarea
                id="answer-box"
                rows="8"
                value={answers[currentIndex] || ""}
                onChange={handleTextChange}
                placeholder="Type your structured explanation, code breakdown, or answer details here..."
                className="w-full p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-lg resize-y shadow-inner"
              ></textarea>
              <p className="text-xs text-right text-slate-400 mt-1">
                {(answers[currentIndex] || "").length} characters
              </p>
            </div>

            {/* Navigation / Action Buttons */}
            <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 gap-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-6 py-2.5 rounded-xl font-semibold border transition-all ${
                  currentIndex === 0
                    ? "opacity-40 cursor-not-allowed border-slate-300 dark:border-slate-800"
                    : "border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                }`}
              >
                Previous
              </button>

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
                    {submitting ? "Submitting..." : "Finish & Submit"}
                  </button>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* Footer info */}
        <footer className="w-full max-w-4xl mx-auto text-center mt-6 text-xs text-slate-500 dark:text-slate-500">
          Mock Interview System &bull; All changes saved locally per question session.
        </footer>

      </div>
    </div>
  );
}

export default RMockInterview;