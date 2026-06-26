import NavBar from "../layouts/NavBar";
import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const interview = location.state?.interview;

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">No Result Found</h1>
      </div>
    );
  }

  const score = interview.overallScore;

  let performance = "";

  if (score >= 85) performance = "Excellent";
  else if (score >= 70) performance = "Very Good";
  else if (score >= 50) performance = "Good";
  else performance = "Needs Improvement";

  return (
    <div className="min-h-screen bg-linear-to-r from-green-200 via-green-50 to-green-200 pb-10">

      <NavBar />

      <div className="max-w-5xl mx-auto px-6 mt-20">

        {/* Heading */}

        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">

          <h1 className="text-5xl font-bold text-green-700 mb-4">
            🎉 Mock Interview Completed
          </h1>

          <p className="text-gray-600 text-lg">
            Your interview has been successfully evaluated.
          </p>

        </div>

        {/* Score */}

        <div className="bg-white rounded-2xl shadow-lg mt-8 p-10">

          <h2 className="text-center text-2xl font-semibold">
            Overall Score
          </h2>

          <div className="text-center mt-5">

            <h1 className="text-7xl font-bold text-green-600">
              {score}
              <span className="text-4xl text-gray-500">/100</span>
            </h1>

          </div>

          <div className="mt-10">

            <div className="flex justify-between mb-2">
              <span>Performance</span>
              <span>{score}%</span>
            </div>

            <div className="bg-gray-300 rounded-full h-6">

              <div
                className="bg-green-500 h-6 rounded-full transition-all duration-700"
                style={{ width: `${score}%` }}
              />

            </div>

          </div>

          <div className="flex justify-center mt-8">

            <div className="bg-green-100 border border-green-400 px-8 py-3 rounded-full">

              <span className="text-xl font-bold text-green-700">
                {performance}
              </span>

            </div>

          </div>

        </div>

        {/* AI Feedback */}

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-xl shadow-lg p-8">

            <h2 className="text-2xl font-bold text-green-600 mb-4">
              💪 Strong Areas
            </h2>

            <p className="text-lg whitespace-pre-line">
              {interview.strongAreas}
            </p>

          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 min-h-72">

            <h2 className="text-2xl font-bold text-red-500 mb-4">
              ⚠ Weak Areas
            </h2>

            <p className="text-lg whitespace-pre-line">
              {interview.weakAreas}
            </p>

          </div>

        </div>

        {/* Suggestions */}

        <div className="bg-white rounded-xl shadow-lg mt-8 p-8">

          <h2 className="text-2xl font-bold text-blue-600 mb-5">
            💡 AI Suggestions
          </h2>

          <p className="text-lg whitespace-pre-line">
            {interview.suggestions}
          </p>

        </div>

        {/* Saved */}

        <div className="bg-white shadow-lg rounded-xl mt-8 p-8 text-center">

          <h2 className="text-2xl font-bold text-green-700">
            ✅ This interview has been recorded successfully.
          </h2>

          <p className="text-gray-600 mt-3 text-lg">
            You can review every question, answer and AI feedback anytime from your interview history.
          </p>

        </div>

        {/* Buttons */}

        <div className="flex justify-center gap-8 mt-8 pb-12">

          <button
            onClick={() => navigate("/history")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-xl font-semibold cursor-pointer"
          >
            📜 View History
          </button>

          <button
            onClick={() => navigate("/interview_simulator")}
            className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl text-xl font-semibold cursor-pointer"
          >
            🔄 Retake Interview
          </button>

        </div>

      </div>

    </div>
  );
}

export default Result;