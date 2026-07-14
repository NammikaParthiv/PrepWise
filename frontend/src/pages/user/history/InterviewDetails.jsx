import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../../utils/axios";
import { FaCommentDots, FaBriefcase, FaRegCalendarAlt } from "react-icons/fa";

const formatFullDateTime = (dateString) => {
  if (!dateString) return "Date unavailable";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    const dateOptions = { month: "short", day: "numeric", year: "numeric" };
    const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };
    return `${d.toLocaleDateString(undefined, dateOptions)} at ${d.toLocaleTimeString(undefined, timeOptions)}`;
  } catch {
    return "Date unavailable";
  }
};

function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/interview/${id}`);
        if (res.data.interview) {
          setInterview(res.data.interview);
        }
      } catch {
        alert("Failed to load interview details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInterviewData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-100 via-purple-50 to-violet-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex justify-center items-center">
        <h1 className="text-2xl font-bold text-violet-900 dark:text-violet-200 animate-pulse">
          Retrieving Session Logs...
        </h1>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-100 via-purple-50 to-violet-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col justify-center items-center gap-4">
        <h1 className="text-3xl font-black text-red-600 dark:text-red-400">
          Session Record Unobtainable
        </h1>
        <button
          onClick={() => navigate("/history")}
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold transition"
        >
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-100 via-purple-50 to-violet-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 pb-16">
      <div className="max-w-5xl mx-auto pt-28 px-6">
        <span className="text-l font-extrabold uppercase tracking-widest text-violet-700 dark:text-violet-300 bg-violet-200/60 dark:bg-violet-800 px-4 py-2 rounded-xl border border-violet-300/40 dark:border-violet-600">
          Interview Review
        </span>

        <div className="bg-linear-to-br from-violet-200 via-violet-100 to-violet-200 dark:from-violet-700 dark:via-violet-600 dark:to-violet-700 rounded-4xl p-8 shadow-md border border-violet-300 dark:border-violet-600 my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-900 dark:text-white">
                <FaBriefcase className="text-xl opacity-80" />
                <h2 className="text-3xl font-black tracking-tight">
                  {interview.job_role || "Custom Track Session"}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-violet-700 dark:text-violet-300">
                <FaRegCalendarAlt className="text-xs" />
                <span>
                  Conducted on {formatFullDateTime(interview.createdAt)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-violet-200 dark:border-violet-600 flex items-center gap-4 self-stretch md:self-auto justify-center">
              <div className="text-center">
                <div className="text-4xl font-black text-violet-900 dark:text-white">
                  {interview.overallScore || interview.score || "N/A"}
                </div>
                <div className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mt-0.5">
                  Overall Score
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-xs border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900 rounded-xl border border-violet-100 dark:border-violet-700">
              <FaCommentDots className="text-violet-600 dark:text-violet-300 text-xl" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Performance Feedback Summary
            </h3>
          </div>

          <div className="space-y-5">
            <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
              <h4 className="text-lg font-bold text-violet-700 dark:text-violet-300 mb-2">
                Strong Areas
              </h4>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {interview.strongAreas || "No strong areas recorded."}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
              <h4 className="text-lg font-bold text-red-500 mb-2">
                Weak Areas
              </h4>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {interview.weakAreas || "No weak areas recorded."}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
              <h4 className="text-lg font-bold text-amber-500 mb-2">
                Final Suggestions
              </h4>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {interview.finalSuggestions || "No suggestions recorded."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewDetails;
