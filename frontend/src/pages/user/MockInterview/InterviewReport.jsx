import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const interview =
    location.state?.interview ||
    location.state?.result?.interview ||
    location.state?.result?.data;

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
          No Result Found
        </h1>
      </div>
    );
  }

  const score = interview.overallScore;

  const performance =
    score >= 70
      ? "Excellent"
      : score >= 50
      ? "Good"
      : score >= 30
      ? "Not Bad"
      : "Needs Improvement";

  return (
    <div className="min-h-screen bg-linear-to-br from-green-100 via-green-50 to-green-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 space-y-8 sm:space-y-10">
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-green-700 dark:text-green-400 mb-4">
            🎉 Mock Interview Completed
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            Your interview has been successfully evaluated.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-10 space-y-8">
          <h2 className="text-center text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white">
            Overall Score
          </h2>
          <div className="text-center">
            <h1 className="text-6xl sm:text-8xl font-black text-green-600 dark:text-green-400">
              {score}
              <span className="text-2xl sm:text-4xl text-gray-500 dark:text-gray-400">/100</span>
            </h1>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
              <span>Performance</span>
              <span>{score}%</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-6 sm:h-7">
              <div
                className="bg-green-500 dark:bg-green-400 h-6 sm:h-7 rounded-full transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 px-6 sm:px-10 py-3 sm:py-4 rounded-full">
              <span className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">
                {performance}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              💪 Strong Areas
            </h2>
            <p className="text-base sm:text-lg whitespace-pre-line text-gray-700 dark:text-gray-200">
              {interview.strongAreas}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400">
              ⚠ Weak Areas
            </h2>
            <p className="text-base sm:text-lg whitespace-pre-line text-gray-700 dark:text-gray-200">
              {interview.weakAreas}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            💡 AI Suggestions
          </h2>
          <p className="text-base sm:text-lg whitespace-pre-line text-gray-700 dark:text-gray-200">
            {interview.suggestions}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 sm:p-8 text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
            ✅ This interview has been recorded successfully.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            You can review every question, answer and AI feedback anytime from your interview history.
          </p>
        </div>

        {/* Responsive buttons: Stacks vertically on mobile (flex-col) and sits nicely in a row on desktop (sm:flex-row) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8">
          <button
            onClick={() => navigate("/u", { replace: true })}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold cursor-pointer transition shadow-md"
          >
            🏠 Go Home
          </button>

          <button
            onClick={() => navigate("/u/history", { replace: true })}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold cursor-pointer transition shadow-md"
          >
            📜 View History
          </button>

          <button
            onClick={() => navigate("/u/interview_simulator", { replace: true })}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold cursor-pointer transition shadow-md"
          >
            🔄 Retake Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;
