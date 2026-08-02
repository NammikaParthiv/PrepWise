import { useNavigate } from "react-router-dom";
import manage_users_pic from "../../assets/manage_users.png";
import statistics_pic from "../../assets/statistics.png";
import add_reference_pic from "../../assets/add_reference.png";

function HomePage() {
  return (
    <div className="min-h-screen transition-all duration-500 bg-linear-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 pt-16 sm:pt-32 overflow-x-hidden">
      <div className="pt-10 pb-10 sm:pt-30 sm:pb-25 px-6 sm:px-10 text-center border-2 sm:border-4 rounded-3xl sm:rounded-4xl mx-4 sm:mx-40 shadow-2xl border-indigo-500 bg-amber-100 dark:border-green-500 dark:bg-indigo-800">
        <h1 className="text-4xl sm:text-7xl font-extrabold text-slate-900 dark:text-white">
          Welcome<span className="text-blue-400"> Admin</span>
        </h1>

        <p className="text-xl sm:text-2xl font-semibold mt-4 sm:mt-6 text-red-700 dark:text-red-200">
          Control Center for Platform Management
        </p>

        <p className="text-sm sm:text-lg max-w-4xl mx-auto mt-4 sm:mt-6 leading-relaxed text-gray-700 dark:text-gray-300">
          Manage users, monitor activity, update content, and keep PrepWise
          running smoothly with powerful admin tools.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-20 px-6 sm:px-20 mt-12 md:mt-24">
        <FeatureCard
          gradient="from-purple-400 to-purple-600"
          heading="Statistics"
          description="Track platform usage and performance."
          image={statistics_pic}
          link="/admin/statistics"
        />
        <FeatureCard
          gradient="from-green-400 to-green-600"
          heading="Manage Users"
          description="View, edit, and control user accounts."
          image={manage_users_pic}
          link="/admin/users"
        />
        <FeatureCard
          gradient="from-blue-400 to-blue-600"
          heading="Add References"
          description="Upload and manage reference materials."
          image={add_reference_pic}
          link="/admin/references"
        />
      </div>

      <div className="text-center py-12 sm:py-20">
        <p className="mt-5 text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
          • Analyze • Practice • Improve • Get Hired •
        </p>
      </div>

      <footer className="border-t py-12 text-center border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300 px-4">
        <h3 className="text-3xl font-bold">
          Prep<span className="text-blue-400">Wise</span>
        </h3>
        <p className="mt-3">AI-Powered Interview Preparation Platform</p>
        <p className="mt-2">Built with React • Node.js • MongoDB • Gemini AI</p>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-6">
          <a
            href="https://github.com/NammikaParthiv"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            💻GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/nammika-parthiv-01478834a/"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            🔗LinkedIn
          </a>
          <a
            href="mailto:nparthiv064.btech2023@ece.nitrr.ac.in"
            className="text-blue-400 hover:underline"
          >
            📧Email
          </a>
        </div>
        <p className="text-sm mt-6 opacity-70">
          © 2026 PrepWise. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;

function FeatureCard({ gradient, heading, description, image, link }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      className="
        group
        w-full
        max-w-sm
        md:w-md
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
        dark:bg-slate-800
        dark:border-slate-700
      "
    >
      <div className="h-48 sm:h-64 overflow-hidden">
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
        className={`bg-linear-to-r ${gradient} p-6 h-40 flex flex-col justify-center`}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 text-center">
          {heading}
        </h2>
        <p className="text-white text-center text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}