import Navbar from "../layouts/NavBar.jsx";
import { useState, useEffect } from "react";
import axios from "../../utils/axios.js";
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
      timeStr: d.toLocaleTimeString(undefined, timeOptions)
    };
  } catch (err) {
    console.log(err);
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
      } catch (err) {
        console.log("Resume History:", err);
        setResumeData([]);
      }
    };

    const fetchInterviewHistory = async () => {
      try {
        const res = await axios.get("/api/interview/history");
        setInterviewData(res.data?.interviews || []);
      } catch (err) {
        console.log("Interview History:", err);
        setInterviewData([]);
      }
    };

    setLoading(true);
    Promise.all([fetchResumeHistory(), fetchInterviewHistory()])
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 pb-16">
      <Navbar />

      <div className="pt-12 px-6 max-w-7xl mx-auto">
       
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Your Activity History
          </h1>
          <p className="text-gray-600 text-lg mt-3 font-medium">
            Review all your previous resume insights and mock interview milestones.
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-16">
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer border
            ${
              activeTab === "resume"
                ? "bg-orange-500 border-orange-600 text-white shadow-xl shadow-orange-500/20 scale-105"
                : "bg-white/80 backdrop-blur-xs border-gray-200 text-gray-700 hover:bg-white hover:text-black"
            }`}
          >
            <span>📄</span> Resume Insights
          </button>

          <button
            onClick={() => setActiveTab("interview")}
            className={`px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer border
            ${
              activeTab === "interview"
                ? "bg-violet-600 border-violet-700 text-white shadow-xl shadow-violet-600/20 scale-105"
                : "bg-white/80 backdrop-blur-xs border-gray-200 text-gray-700 hover:bg-white hover:text-black"
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
            {resumeData && resumeData.length > 0 ? (
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
              <div className="col-span-full text-center py-16 bg-white/40 rounded-3xl border border-dashed border-gray-300 w-full max-w-2xl">
                <p className="text-2xl font-bold text-gray-500">No Resume History Found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {interviewData && interviewData.length > 0 ? (
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
              <div className="col-span-full text-center py-16 bg-white/40 rounded-3xl border border-dashed border-gray-300 w-full max-w-2xl">
                <p className="text-2xl font-bold text-gray-500">No Interview History Found</p>
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
    <div className="group relative flex flex-col justify-between h-77.5 w-full max-w-87.5 bg-linear-to-br from-orange-300 via-orange-100 to-orange-300 border border-orange-200/60 rounded-4xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
      
      <div>
        <div className="flex justify-between items-baseline border-b border-orange-400/20 pb-3 mb-4">
          <span className="text-2xl font-black text-orange-950 tracking-tight">
            {dateStr}
          </span>
          <span className="text-sm font-bold text-orange-800/80">
            ⏰ {timeStr}
          </span>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-orange-950 line-clamp-2 tracking-tight leading-snug">
            {role}
          </h2>
          
          <div className="inline-flex items-baseline gap-1 bg-white/50 px-3 py-1 rounded-xl border border-orange-200/40 backdrop-blur-xs">
            <span className="text-xl font-black tracking-tight text-orange-950">
              {score}%
            </span>
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Match</span>
          </div>
        </div>
      </div>
     <button
        onClick={() => navigate(`/u/history/resume/${id}`)}
        className="w-full bg-white/80 hover:bg-orange-500 text-orange-950 hover:text-white py-3 px-4 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-orange-200/40"
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
    <div className="group relative flex flex-col justify-between h-77.5 w-full max-w-87.5 bg-linear-to-br from-violet-300 via-violet-100 to-violet-300 border border-violet-200/60 rounded-4xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">

      <div>
        <div className="flex justify-between items-baseline border-b border-violet-400/20 pb-3 mb-4">
          <span className="text-2xl font-black text-violet-950 tracking-tight">
            {dateStr}
          </span>
          <span className="text-sm font-bold text-violet-800/80">
            ⏰ {timeStr}
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-violet-950 line-clamp-2 tracking-tight leading-snug">
            Role: {role}
          </h2>
          
          <div className="inline-flex items-baseline gap-1 bg-white/50 px-3 py-1 rounded-xl border border-violet-200/40 backdrop-blur-xs">
            <span className="text-xl font-black tracking-tight text-violet-950">
              {score}
            </span>
            <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider">Rating</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/u/history/interview/${id}`)}
        className="w-full bg-white/80 hover:bg-violet-600 text-violet-950 hover:text-white py-3 px-4 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-violet-200/40"
      >
        <span className="text-sm">View Details</span>
        <span className="text-sm transform group-hover:translate-x-1 transition-transform duration-200">→</span>
      </button>
    </div>
  );
}