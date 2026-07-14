import { useState, useEffect } from "react";
import axios from "../../../utils/axios.js";
import { useNavigate } from "react-router-dom";

const parseDateTime = (dateString) => {
  if (!dateString) return { dateStr: "N/A", timeStr: "--:--" };
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { dateStr: "Invalid", timeStr: "--:--" };

    const dateOptions = { month: "short", day: "numeric", year: "numeric" };
    const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };

    return {
      dateStr: d.toLocaleDateString(undefined, dateOptions),
      timeStr: d.toLocaleTimeString(undefined, timeOptions),
    };
  } catch {
    return { dateStr: "N/A", timeStr: "--:--" };
  }
};
function History() {
  const [activeTab, setActiveTab] = useState("resume");
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);

  useEffect(() => {
    const fetchResumeHistory = async () => {
      try {
        const res = await axios.get("/api/resume_analyser/resume_history");
        setResumeData(res.data?.resumes || []);
      } catch {
        setResumeData([]);
      }
    };

    const fetchInterviewHistory = async () => {
      try {
        const res = await axios.get("/api/interview/history");
        setInterviewData(res.data?.interviews || []);
        setLoading(true);
      } catch {
        setInterviewData([]);
      }
    };
    
    Promise.all([fetchResumeHistory(), fetchInterviewHistory()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Dynamic background
  const bgClass =
    activeTab === "resume"
      ? "bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900"
      : "bg-linear-to-br from-violet-100 via-purple-50 to-violet-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900";

  return (
    <div className={`min-h-screen ${bgClass} pb-16 text-slate-900 dark:text-white`}>
      <div className="pt-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Your Activity History 📜
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-3 font-medium">
            Review all your previous resume insights and mock interview milestones.
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-16">
          <button
            onClick={() => setActiveTab("resume")}
            className={`w-64 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer border
            ${
              activeTab === "resume"
                ? "bg-orange-500 border-orange-600 text-white shadow-md scale-105"
                : "bg-white border-gray-200 text-gray-700 hover:bg-orange-100 dark:bg-slate-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
            }`}
          >
            <span>📄</span> Resume Insights
          </button>

          <button
            onClick={() => setActiveTab("interview")}
            className={`w-64 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer border
            ${
              activeTab === "interview"
                ? "bg-violet-600 border-violet-700 text-white shadow-md scale-105"
                : "bg-white border-gray-200 text-gray-700 hover:bg-violet-100 dark:bg-slate-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
            }`}
          >
            <span>🎤</span> Mock Interviews
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="text-center text-xl font-bold text-gray-400 animate-pulse">
              Gathering records...
            </div>
          </div>
        ) : activeTab === "resume" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {resumeData.length > 0 ? (
              resumeData.map((item) => (
                <ResumeCard
                  key={item._id}
                  id={item._id}
                  score={item.score}
                  role={item.job_role}
                  date={item.createdAt}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-600 w-full max-w-2xl">
                <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                  No Resume History Found
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {interviewData.length > 0 ? (
              interviewData.map((item) => (
                <InterviewCard
                  key={item._id}
                  id={item._id}
                  score={item.overallScore}
                  role={item.job_role}
                  date={item.createdAt}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-600 w-full max-w-2xl">
                <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                  No Interview History Found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default History;

export function ResumeCard({ id, score, role, date }) {
  const navigate = useNavigate();
  const { dateStr, timeStr } = parseDateTime(date);

  return (
    <div className="group relative flex flex-col justify-between h-77.5 w-full max-w-87.5 
      bg-linear-to-br from-orange-100 via-orange-50 to-orange-100 
      dark:from-orange-700 dark:via-orange-600 dark:to-orange-700 
      border border-orange-300 dark:border-orange-600 
      rounded-4xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      
      <div>
        <div className="flex justify-between items-baseline border-b border-orange-300 dark:border-orange-500 pb-3 mb-4">
          <span className="text-2xl font-black text-orange-900 dark:text-white">{dateStr}</span>
          <span className="text-sm font-bold text-orange-700 dark:text-orange-200">⏰ {timeStr}</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-orange-900 dark:text-white leading-snug">
            {role}
          </h2>
          <div className="inline-flex items-baseline gap-1 
            bg-white px-3 py-1 rounded-xl border border-orange-200 
            dark:bg-slate-800 dark:border-orange-500">
            <span className="text-xl font-black text-orange-900 dark:text-white">{score}%</span>
            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-200 uppercase tracking-wider">
              Match
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate(`/u/history/resume/${id}`)}
        className="w-full bg-white hover:bg-orange-500 text-orange-900 hover:text-white 
          dark:bg-slate-800 dark:text-white dark:hover:bg-orange-500 
          py-3 px-4 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all duration-300 
          flex items-center justify-center gap-2 cursor-pointer border border-orange-200 dark:border-orange-500"
      >
        <span className="text-sm">View Details</span>
        <span className="text-sm transform group-hover:translate-x-1 transition-transform duration-200">→</span>
      </button>
    </div>
  );
}
export function InterviewCard({ id, score, role, date }) {
  const navigate = useNavigate();
  const { dateStr, timeStr } = parseDateTime(date);

  return (
    <div className="relative flex flex-col justify-between h-77 w-full max-w-88
      bg-linear-to-br from-violet-100 via-violet-50 to-violet-100 
      dark:from-violet-700 dark:via-violet-600 dark:to-violet-700 
      border border-violet-300 dark:border-violet-600 
      rounded-4xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      
      <div>
        <div className="flex justify-between items-baseline border-b border-violet-300 dark:border-violet-500 pb-3 mb-4">
          <span className="text-2xl font-black text-violet-900 dark:text-white">{dateStr}</span>
          <span className="text-sm font-bold text-violet-700 dark:text-violet-200">⏰ {timeStr}</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-violet-900 dark:text-white leading-snug">
            Role: {role}
          </h2>
          <div className="inline-flex items-baseline gap-1 
            bg-white px-3 py-1 rounded-xl border border-violet-200 
            dark:bg-slate-800 dark:border-violet-500">
            <span className="text-xl font-black text-violet-900 dark:text-white">{score}</span>
            <span className="text-[10px] font-bold text-violet-700 dark:text-violet-200 uppercase tracking-wider">
              Rating
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate(`/u/history/interview/${id}`)}
        className="w-full bg-white hover:bg-violet-600 text-violet-900 hover:text-white 
          dark:bg-slate-800 dark:text-white dark:hover:bg-violet-600 
          py-3 px-4 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all duration-300 
          flex items-center justify-center gap-2 cursor-pointer border border-violet-200 dark:border-violet-500"
      >
        <span className="text-sm">View Details</span>
        <span className="text-sm transform group-hover:translate-x-1 transition-transform duration-200">→</span>
      </button>
    </div>
  );
}
