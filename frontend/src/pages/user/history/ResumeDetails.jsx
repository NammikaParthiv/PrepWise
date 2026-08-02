import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../../utils/axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb,
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
  } catch {
    return "Date unavailable";
  }
};

function ResumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      if (!id) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await axios.get(`/api/resume_analyser/resume_history`);
        const targetReport = res.data?.resumes?.find((r) => r._id === id);

        if (targetReport) {
          if (isMounted) {
            setResume(targetReport);
          }
        } else {
          const directRes = await axios.get(`/api/resume/${id}`);
          if (isMounted) {
            setResume(directRes.data.resume);
          }
        }
      } catch {
        if (isMounted) {
          setResume(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResume();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex justify-center items-center">
        <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-200 animate-pulse">
          Loading Analysis...
        </h1>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col justify-center items-center gap-4">
        <h1 className="text-3xl font-black text-red-600 dark:text-red-400">Report Not Found</h1>
        <button
          onClick={() => navigate("/history")}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold transition"
        >
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 pb-16">
      <div className="max-w-5xl mx-auto pt-28 px-6">
        <span className="text-l font-extrabold uppercase tracking-widest text-orange-700 dark:text-orange-300 bg-orange-200/60 dark:bg-orange-800 px-4 py-2 rounded-xl border border-orange-300/40 dark:border-orange-600">
          Resume Report
        </span>

        <div className="bg-linear-to-br from-orange-200 via-orange-100 to-orange-200 dark:from-orange-700 dark:via-orange-600 dark:to-orange-700 rounded-4xl p-8 shadow-md border border-orange-200 dark:border-orange-600 mb-8 mt-9">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-900 dark:text-white">
                <FaFileAlt className="text-xl opacity-80" />
                <h2 className="text-3xl font-black tracking-tight">
                  {resume.resume_name || "Uploaded Document"}
                </h2>
              </div>
              <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
                Target Role: <span className="font-extrabold">{resume.job_role}</span>
              </p>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                Analyzed on {formatFullDateTime(resume.createdAt)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-orange-200 dark:border-orange-600 flex items-center gap-4 self-stretch md:self-auto justify-center">
              <div className="text-center">
                <div className="text-4xl font-black text-orange-900 dark:text-white">
                  {resume.score}%
                </div>
                <div className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider mt-0.5">
                  Match Rating
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-xs border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-50 dark:bg-green-900 rounded-xl border border-green-100 dark:border-green-700">
                <FaCheckCircle className="text-green-600 dark:text-green-300 text-xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Key Strengths
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-xl font-medium">
              {resume.pros}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-xs border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 dark:bg-red-900 rounded-xl border border-red-100 dark:border-red-700">
                <FaTimesCircle className="text-red-500 dark:text-red-300 text-xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Areas for Improvement
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-xl font-medium">
              {resume.cons}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-xs border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900 rounded-xl border border-amber-100 dark:border-amber-700">
                <FaLightbulb className="text-amber-500 dark:text-amber-300 text-xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Recommended Next Steps
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-xl font-medium">
              {resume.needImprove}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-xs border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Target Job Description
            </h3>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line text-l font-medium bg-white/50 dark:bg-slate-700 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
              {resume.job_description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeDetails;