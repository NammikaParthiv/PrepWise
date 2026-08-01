import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axios.js";

function InterviewSimulator() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    if (!role) {
      alert("Please select a job role");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/interview/generate", {
        job_role: role,
      });
      if (res.data.interview) {
        navigate("/u/interview_simulator/session", {
          state: {
            interview: res.data.interview,
          },
          replace: true,
        });
      } else {
        // polling -> req for the same api until it gives questions
        const interviewId = res.data.interviewId;
        const interval = setInterval(async () => {
          const response = await axios.get(`/api/interview/${interviewId}`);

          if (response.data.interview.status === "completed") {
            clearInterval(interval);
            setLoading(false);
            navigate("/u/interview_simulator/session", {
              state: {
                interview: response.data.interview,
              },
              replace: true,
            });
          }
          if (response.data.interview.status === "failed") {
            clearInterval(interval);
            alert("Interview generation failed!");
            setLoading(false);
          }
        }, 2000); // 2 sec
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.msg || error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-16 sm:pb-20 bg-linear-to-br from-blue-500 via-blue-200 to-indigo-500 dark:from-indigo-900 dark:via-slate-900 dark:to-black text-black dark:text-white px-4 sm:px-6">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-8 sm:mt-10 animate-pulse tracking-widest text-center">
            GENERATING QUESTIONS...
          </h1>
        </div>
      )}

      <div
        className={`transition-opacity duration-500 ${loading ? "opacity-20 pointer-events-none" : "opacity-100"}`}
      >
        {/* Header Title */}
        <div className="pt-10 sm:pt-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold p-4 sm:p-6 bg-linear-to-r from-blue-500 to-violet-600 dark:from-indigo-700 dark:to-violet-600 text-white rounded-2xl shadow-2xl text-center w-full sm:w-fit mx-auto">
            Mock Interview
          </h1>
        </div>

        {/* Main Content Box */}
        <div className="w-full max-w-4xl mx-auto flex flex-col shadow-2xl rounded-2xl border-2 p-6 sm:p-10 mt-8 sm:mt-16 bg-amber-300 dark:bg-slate-800 border-gray-300 dark:border-slate-700">
          <p className="text-xl sm:text-2xl mb-6 text-center font-medium">
            Select your job role for giving the interview:
          </p>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border-2 border-indigo-500 w-full sm:w-3/4 mx-auto rounded-lg p-3 sm:p-4 text-lg sm:text-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">Select</option>
            <option value="frontend">Frontend Developer</option>
            <option value="backend">Backend Developer</option>
            <option value="fullstack">MERN Full Stack Developer</option>
            <option value="data_analyst">Data Analyst</option>
          </select>

          {/* Info Card */}
          <div className="text-center bg-gray-200 dark:bg-slate-700 p-6 sm:p-8 border border-gray-500 dark:border-slate-600 rounded-xl mt-8 sm:mt-10">
            <p className="text-2xl sm:text-3xl font-bold mb-4">
              🔔 This interview will contain:
            </p>
            <ul className="text-base sm:text-xl font-semibold text-left list-disc list-inside space-y-2 max-w-md mx-auto">
              <li>✅ Technical questions</li>
              <li>✅ Conceptual questions</li>
              <li>✅ Real interview style questions</li>
              <li>✅ AI evaluation and feedback</li>
            </ul>
          </div>

          <button
            type="button"
            disabled={loading}
            className="self-center w-full sm:w-auto px-10 py-3.5 sm:py-4 text-lg sm:text-xl rounded-lg mt-8 sm:mt-10 font-bold transition-all duration-300 bg-green-600 hover:bg-green-700 cursor-pointer text-white shadow-lg"
            onClick={startInterview}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSimulator;