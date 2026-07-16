import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axios.js";

function InterviewSimulator() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const stratInterview = async () => {
    if (!role) {
      alert("Please select a job role");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/interview/generate", {
        job_role: role,
      });
      navigate("/u/interview_simulator/session", {
        state: {
          interview: res.data.interview,
        },
        replace:true,
      });
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);
      alert(error.response?.data?.msg || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 
      bg-linear-to-br from-blue-500 via-blue-200 to-indigo-500 
      dark:from-indigo-900 dark:via-slate-900 dark:to-black 
      text-black dark:text-white">
      
      <div className="pt-16">
        <h1 className="text-5xl font-extrabold p-6 
          bg-linear-to-r from-blue-500 to-violet-600 
          dark:from-indigo-700 dark:to-violet-600 
          text-white rounded-2xl shadow-2xl text-center w-fit mx-auto">
          Mock Interview
        </h1>
      </div>

      <div className="w-3/4 mx-auto flex flex-col shadow-2xl rounded-2xl 
        border-2 p-10 mt-16 
        bg-amber-300 dark:bg-slate-800 
        border-gray-300 dark:border-slate-700">
        
        <p className="text-2xl mb-6 text-center">
          Select your job role for giving the interview:
        </p>
        
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border-2 border-indigo-500 w-3/4 mx-auto rounded-lg p-4 text-xl 
            bg-white dark:bg-slate-900 
            text-black dark:text-white 
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select</option>
          <option value="frontend">Frontend Developer</option>
          <option value="backend">Backend Developer</option>
          <option value="fullstack">MERN Full Stack Developer</option>
          <option value="data_analyst">Data Analyst</option>
        </select>

        <div className="text-center bg-gray-200 dark:bg-slate-700 p-8 
          border border-gray-500 dark:border-slate-600 
          rounded-xl mt-10">
          <p className="text-3xl font-bold mb-4">🔔 This interview will contain:</p>
          <ul className="text-xl font-semibold text-left list-disc list-inside space-y-2">
            <li>✅ Technical questions</li>
            <li>✅ Conceptual questions</li>
            <li>✅ Real interview style questions</li>
            <li>✅ AI evaluation and feedback</li>
          </ul>
        </div>

        <p className="text-xl text-center mt-8">Click below to start the interview</p>
        <button
          type="button"
          disabled={loading}
          className={`self-center px-10 py-4 text-xl rounded-lg mt-6 font-bold transition-all duration-300
            ${
              loading
                ? "bg-green-700 cursor-not-allowed scale-105"
                : "bg-green-600 hover:bg-green-700 cursor-pointer"
            }`}
          onClick={stratInterview}
        >
          {loading ? "Generating questions..." : "Start"}
        </button>
      </div>
    </div>
  );
}

export default InterviewSimulator;
