import Navbar from "../layouts/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb,
  FaArrowLeft,
  FaFileAlt,
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

function ResumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get(`/api/resume_analyser/resume_history`);
        const targetReport = res.data?.resumes?.find((r) => r._id === id);

        if (targetReport) {
          setResume(targetReport);
        } else {
          const directRes = await axios.get(`/api/resume/${id}`);
          setResume(directRes.data.resume);
        }
      } catch (error) {
        console.log(error);
        alert("Unable to fetch report");
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100">
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <h1 className="text-2xl font-bold text-orange-950 animate-pulse">
            Loading Analysis...
          </h1>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100">
        <Navbar />
        <div className="min-h-screen flex flex-col justify-center items-center gap-4">
          <h1 className="text-3xl font-black text-red-500">Report Not Found</h1>
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

          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-700 bg-orange-200/60 px-4 py-2 rounded-xl border border-orange-300/40">
            Resume Report
          </span>
        </div>

        <div className="bg-linear-to-br from-orange-300 via-orange-100 to-orange-300 rounded-4xl p-8 shadow-md border border-orange-200/60 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-950">
                <FaFileAlt className="text-xl opacity-80" />
                <h2 className="text-3xl font-black tracking-tight">
                  {resume.resume_name || "Uploaded Document"}
                </h2>
              </div>
              <p className="text-lg font-bold text-orange-900/90">
                Target Role:{" "}
                <span className="font-extrabold">{resume.job_role}</span>
              </p>
              <p className="text-sm font-semibold text-orange-800/80">
                Analyzed on {formatFullDateTime(resume.createdAt)}
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-3xl border border-orange-200/40 backdrop-blur-md flex items-center gap-4 self-stretch md:self-auto justify-center">
              <div className="text-center">
                <div className="text-4xl font-black text-orange-950">
                  {resume.score}%
                </div>
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mt-0.5">
                  Match Rating
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-[28px] p-8 shadow-xs border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-50 rounded-xl border border-green-100">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                Key Strengths
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-xl font-medium">
              {resume.pros}
            </p>
          </div>

          <div className="bg-white rounded-[28px] p-8 shadow-xs border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                <FaTimesCircle className="text-red-500 text-xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                Areas for Improvement
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-xl font-medium">
              {resume.cons}
            </p>
          </div>

          <div className="bg-white rounded-[28px] p-8 shadow-xs border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <FaLightbulb className="text-amber-500 text-xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                Recommended Next Steps
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-xl font-medium">
              {resume.needImprove}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xs rounded-[28px] p-8 shadow-xs border border-gray-200/60">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Target Job Description
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-l font-medium bg-white/50 p-5 rounded-2xl border border-gray-100">
              {resume.job_description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeDetails;
