import NavBar from "../layouts/NavBar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import manage_users_pic from "../../assets/manage_users.png";
import statistics_pic from "../../assets/statistics.png";
import add_reference_pic from "../../assets/add_reference.png";

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
        } pt-32`}
      >
        <div
          className={`pt-30 pb-25 px-10 text-center border-4 rounded-4xl mx-40 shadow-2xl ${
            darkMode ? "border-green-500 bg-blue-800" : "border-indigo-500 bg-white"
          }`}
        >
          <h1
            className={`text-6xl font-extrabold ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Welcome<span className="text-blue-400"> Admin</span>
          </h1>

          <p
            className={`text-2xl font-semibold mt-6 ${
              darkMode ? "text-red-200" : "text-red-700"
            }`}
          >
            Control Center for Platform Management
          </p>

          <p
            className={`text-lg max-w-4xl mx-auto mt-6 leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Manage users, monitor activity, update content, and keep PrepWise
            running smoothly with powerful admin tools.
          </p>
        </div>

        <div className="flex justify-center gap-20 px-20 mt-24 flex-nowrap">
          <FeatureCard
            gradient="from-purple-400 to-purple-600"
            heading="Statistics"
            description="Track platform usage and performance."
            image={statistics_pic}
            link="/statistics"
          />
          <FeatureCard
            gradient="from-green-400 to-green-600"
            heading="Manage Users"
            description="View, edit, and control user accounts."
            image={manage_users_pic}
            link="/users"
          />
          <FeatureCard
            gradient="from-blue-400 to-blue-600"
            heading="Add References"
            description="Upload and manage reference materials."
            image={add_reference_pic}
            link="/add_references"
          />
        </div>

        <div className="text-center py-20">
          <p
            className={`mt-5 text-xl ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            • Analyze • Practice • Improve • Get Hired •
          </p>
        </div>

        <footer
          className={`border-t py-12 text-center ${
            darkMode
              ? "border-gray-700 text-gray-300"
              : "border-gray-300 text-gray-700"
          }`}
        >
          <h3 className="text-3xl font-bold">
            Prep<span className="text-blue-400">Wise</span>
          </h3>
          <p className="mt-3">AI-Powered Interview Preparation Platform</p>
          <p className="mt-2">Built with React • Node.js • MongoDB • Gemini AI</p>
          <div className="flex justify-center gap-10 mt-6">
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
    </>
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
        w-md
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
      <div className="h-64 overflow-hidden">
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
        <h2 className="text-3xl font-bold text-black mb-3 text-center">
          {heading}
        </h2>
        <p className="text-white text-center text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
