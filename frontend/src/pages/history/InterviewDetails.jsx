import Navbar from "../layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import {
  FaArrowLeft,
  FaCommentDots,
  FaBriefcase,
  FaRegCalendarAlt,
} from "react-icons/fa";

const formatFullDateTime = (dateString) => {
  if (!dateString) return "Date unavailable";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    const dateOptions = { month: "short", day: "numeric", year: "numeric" };
    const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };
    return `${d.toLocaleDateString(undefined, dateOptions)} at ${d.toLocaleTimeString(undefined, timeOptions)}`;
  } catch (err) {
    console.log(err);
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
        const res = await axios.get("/api/interview/history");
        const match = res.data?.interviews?.find((item) => item._id === id);

        if (match) {
          setInterview(match);
        } else {
          const fallback = await axios.get(`/api/interview/${id}`);
          setInterview(fallback.data.interview);
        }
      } catch (error) {
        console.log(error);
        alert("Unable to fetch session logs");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100">
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <h1 className="text-2xl font-bold text-violet-950 animate-pulse">
            Retrieving Session Logs...
          </h1>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100">
        <Navbar />
        <div className="min-h-screen flex flex-col justify-center items-center gap-4">
          <h1 className="text-3xl font-black text-red-500">
            Session Record Unobtainable
          </h1>
          <button
            onClick={() => navigate("/history")}
            className="bg-black text-white px-5 py-2.5 rounded-xl font-bold"
          >
            Return to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto pt-28 px-6">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 bg-white text-gray-800 font-bold px-5 py-3 rounded-2xl shadow-xs border border-gray-200/80 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to History</span>
          </button>

          <span className="text-xs font-extrabold uppercase tracking-widest text-violet-700 bg-violet-200/60 px-4 py-2 rounded-xl border border-violet-300/40">
            Interview Review
          </span>
        </div>

        <div className="bg-linear-to-br from-violet-300 via-violet-100 to-violet-300 rounded-4xl p-8 shadow-md border border-violet-200/60 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-950">
                <FaBriefcase className="text-xl opacity-80" />
                <h2 className="text-3xl font-black tracking-tight">
                  {interview.job_role || "Custom Track Session"}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-violet-950/80">
                <FaRegCalendarAlt className="text-xs" />
                <span>
                  Conducted on {formatFullDateTime(interview.createdAt)}
                </span>
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-3xl border border-violet-200/40 backdrop-blur-md flex items-center gap-4 self-stretch md:self-auto justify-center">
              <div className="text-center">
                <div className="text-4xl font-black text-violet-950">
                  {interview.overallScore || interview.score || "N/A"}
                </div>
                <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mt-0.5">
                  Overall Score
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-8 shadow-xs border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-50 rounded-xl border border-violet-100">
              <FaCommentDots className="text-violet-600 text-xl" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              Performance Feedback Summary
            </h3>
          </div>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base font-medium bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            {interview.feedback ||
              interview.remarks ||
              "No specific feedback breakdown captured for this entry session log."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default InterviewDetails;
