import NavBar from "./layouts/NavBar";
import resumeImg from "../assets/resume_analyser.png";
import interviewImg from "../assets/mock_interview.png";
import historyImg from "../assets/history.png";
import studyPlannerImg from "../assets/study_planner.png";
import notesImg from "../assets/notes.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
function HomePage() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <>
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
            ? "bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900"
            : "bg-linear-to-br from-blue-50 via-white to-indigo-100"
        }`}
      >
        <div className="px-35 pt-12">
          <div
            className={`pt-28 pb-18 px-10 text-center border-4 rounded-4xl m-10 shadow-2xl ${
              darkMode ? "border-green-500 bg-indigo-800" : "border-blue-500 bg-amber-100"
            }`}
          >
            <h1
              className={`text-8xl font-extrabold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Prep<span className="text-blue-400">Wise</span>
            </h1>

            <p
              className={`text-3xl font-semibold mt-6 ${
                darkMode ? "text-blue-200" : "text-blue-700"
              }`}
            >
              AI-Powered Interview Preparation Platform
            </p>

            <p
              className={`text-lg max-w-4xl mx-auto mt-6 leading-relaxed ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Analyze resumes, practice interviews, organize your preparation
              journey and track your progress — all in one place.
            </p>
          </div>

          <div className="px-10 pb-20">
            <h2
              className={`text-5xl font-bold text-center mb-16 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Explore Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-50 gap-y-20 justify-items-center">
              <FeatureCard
                color="from-rose-400 to-rose-600"
                heading="📑Resume Analyzer"
                description="AI-powered feedback to improve resume quality and ATS compatibility."
                image={resumeImg}
                link="/resume_analyser"
              />

              <FeatureCard
                color="from-indigo-400 to-blue-600"
                heading="🗣️Mock Interview"
                description="Practice realistic interviews with AI evaluation and scoring."
                image={interviewImg}
                link="/interview_simulator"
              />

              <FeatureCard
                color="from-orange-400 to-amber-600"
                heading="🎯Study Planner"
                description="Organize preparation goals and stay consistent every day."
                image={studyPlannerImg}
                link="/study_planner"
              />

              <FeatureCard
                color="from-emerald-400 to-green-600"
                heading="📝Notes"
                description="Store important concepts, revision notes and resources."
                image={notesImg}
                link="/notes"
              />

              <FeatureCard
                color="from-yellow-400 to-yellow-600"
                heading="🕒History"
                description="Track previous analyses and interview performance."
                image={historyImg}
                link="/history"
              />
            </div>
          </div>

          <div className="text-center py-20">
            <h2
              className={`text-5xl font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Your Journey Starts Here
            </h2>

            <p
              className={`mt-5 text-xl ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              • Analyze • Practice • Improve • Get Hired •
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;

function FeatureCard({ color, heading, description, image, link }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      className="
        group
        w-100
        bg-white
        rounded-3xl
        overflow-hidden
        cursor-pointer
        shadow-lg
        hover:shadow-2xl
        hover:-translate-y-3
        transition-all
        duration-300
        border-2
      "
    >
      <div className="h-56 overflow-hidden">
        <img
          src={image}
          alt={heading}
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />
      </div>

      <div
        className={`bg-linear-to-r ${color} p-6 h-40 flex flex-col justify-center`}
      >
        <h2 className="text-4xl font-bold text-black mb-3 text-center">
          {heading}
        </h2>

        <p className="text-white text-center text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
