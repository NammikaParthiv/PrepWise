import resumeImg from "../../assets/resume_analyser.png";
import interviewImg from "../../assets/mock_interview.png";
import historyImg from "../../assets/history.png";
import studyPlannerImg from "../../assets/study_planner.png";
import notesImg from "../../assets/notes.png";
import { useNavigate } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen transition-all duration-500 bg-linear-to-r from-indigo-300 via-sky-100 to-blue-300 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 overflow-x-hidden">
      <div className="px-4 sm:px-8 lg:px-16 pt-8 sm:pt-12 max-w-7xl mx-auto">
        
        <div className="pt-12 pb-10 sm:pt-28 sm:pb-18 px-6 sm:px-10 text-center border-2 sm:border-4 rounded-3xl sm:rounded-4xl my-6 sm:my-10 shadow-2xl border-slate-900 dark:border-green-500 bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700 dark:bg-indigo-800">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight">
            Prep<span className="text-amber-300 dark:text-blue-400">Wise</span>
          </h1>

          <p className="text-xl sm:text-3xl font-semibold mt-4 sm:mt-6 text-indigo-100 dark:text-blue-200">
            AI-Powered Interview Preparation Platform
          </p>

          <p className="text-sm sm:text-lg max-w-4xl mx-auto mt-4 sm:mt-6 leading-relaxed text-indigo-50/90 dark:text-gray-300">
            Analyze resumes, practice interviews, organize your preparation
            journey and track your progress — all in one place.
          </p>
        </div>

        {/* Explore Features Section */}
        <div className="px-2 sm:px-6 pb-16 sm:pb-20">
          <h2 className="text-3xl sm:text-5xl font-bold text-center mb-10 sm:mb-16 text-slate-900 dark:text-white">
            Explore Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-60 justify-items-center justify-center max-w-6xl mx-auto">
            <FeatureCard
              color="from-rose-400 to-rose-600"
              heading="📑 Resume Analyzer"
              description="AI-powered feedback to improve resume quality and ATS compatibility."
              image={resumeImg}
              link="/u/resume_analyser"
            />
            <FeatureCard
              color="from-indigo-400 to-blue-600"
              heading="🗣️ Mock Interview"
              description="Practice realistic interviews with AI evaluation and scoring."
              image={interviewImg}
              link="/u/interview_simulator"
            />
            <FeatureCard
              color="from-orange-400 to-amber-600"
              heading="🎯 Study Planner"
              description="Organize preparation goals and stay consistent every day."
              image={studyPlannerImg}
              link="/u/study_planner"
            />
            <FeatureCard
              color="from-emerald-400 to-green-600"
              heading="📝 Notes"
              description="Store important concepts, revision notes and resources."
              image={notesImg}
              link="/u/references"
            />
            <FeatureCard
              color="from-yellow-400 to-yellow-600"
              heading="🕒 History"
              description="Track previous analyses and interview performance."
              image={historyImg}
              link="/u/history"
            />
          </div>
        </div>

        {/* Footer Catchphrase Section */}
        <div className="text-center py-12 sm:py-20">
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white">
            Your Journey Starts Here
          </h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-xl text-indigo-900/80 dark:text-gray-300 font-medium">
            • Analyze • Practice • Improve • Get Hired •
          </p>
        </div>

      </div>
    </div>
  );
}

export default HomePage;

function FeatureCard({ color, heading, description, image, link }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      className="group w-full max-w-sm sm:w-80 md:w-96 bg-white dark:bg-slate-800 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-gray-200 dark:border-slate-700"
    >
      <div className="h-48 sm:h-56 overflow-hidden">
        <img
          src={image}
          alt={heading}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className={`bg-linear-to-r ${color} p-6 h-40 flex flex-col justify-center text-slate-900`}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">{heading}</h2>
        <p className="text-white text-center text-xs sm:text-sm leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}