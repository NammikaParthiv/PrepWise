import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../../utils/axios";
import {
  FaCommentDots,
  FaBriefcase,
  FaRegCalendarAlt,
  FaQuestionCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlusCircle,
  FaMinusCircle,
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

function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInterviewData = async () => {
      if (!id) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await axios.get(`/api/interview/${id}`);
        if (isMounted && res.data.interview) {
          setInterview(res.data.interview);
        }
      } catch {
        if (isMounted) {
          setInterview(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInterviewData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-100 via-purple-50 to-violet-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex justify-center items-center px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-violet-900 dark:text-violet-200 animate-pulse text-center">
          Retrieving Session Logs...
        </h1>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-100 via-purple-50 to-violet-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col justify-center items-center gap-4 px-4">
        <h1 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 text-center">
          Session Record Unobtainable
        </h1>
        <button
          onClick={() => navigate("/u/history")}
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold transition cursor-pointer text-sm sm:text-base"
        >
          Return to History
        </button>
      </div>
    );
  }

  const suggestionsText = interview.suggestions || interview.finalSuggestions;

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-100 via-purple-50 to-violet-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl xl:max-w-7xl mx-auto pt-24 sm:pt-28">
        
        {/* Top Header Badge */}
        <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-widest text-violet-700 dark:text-violet-300 bg-violet-200/60 dark:bg-violet-800 px-4 py-2 rounded-xl border border-violet-300/40 dark:border-violet-600">
          Interview Review
        </span>

        {/* Main Overview Banner */}
        <div className="bg-linear-to-br from-violet-200 via-violet-100 to-violet-200 dark:from-violet-700 dark:via-violet-600 dark:to-violet-700 rounded-3xl sm:rounded-4xl p-6 sm:p-8 shadow-md border border-violet-300 dark:border-violet-600 my-6 sm:my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-900 dark:text-white">
                <FaBriefcase className="text-lg sm:text-xl opacity-80 shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight break-words">
                  {interview.job_role || "Custom Track Session"}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-violet-700 dark:text-violet-300">
                <FaRegCalendarAlt className="text-xs shrink-0" />
                <span>
                  Conducted on {formatFullDateTime(interview.createdAt)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 px-6 rounded-2xl sm:rounded-3xl border border-violet-200 dark:border-violet-600 flex items-center gap-4 self-stretch md:self-auto justify-center shadow-sm">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-violet-900 dark:text-white">
                  {interview.overallScore || interview.score || "N/A"}
                </div>
                <div className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mt-0.5">
                  Overall Score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Feedback Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[28px] p-6 sm:p-8 lg:p-10 shadow-xs border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900 rounded-xl border border-violet-100 dark:border-violet-700">
              <FaCommentDots className="text-violet-600 dark:text-violet-300 text-lg sm:text-xl" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
              Performance Feedback Summary
            </h3>
          </div>

          <div className="space-y-5">
            <div className="bg-gray-50 dark:bg-slate-700/50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-100 dark:border-gray-600">
              <h4 className="text-base sm:text-lg font-bold text-violet-700 dark:text-violet-300 mb-2">
                Strong Areas
              </h4>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {interview.strongAreas || "No strong areas recorded."}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-100 dark:border-gray-600">
              <h4 className="text-base sm:text-lg font-bold text-red-500 dark:text-red-400 mb-2">
                Weak Areas
              </h4>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {interview.weakAreas || "No weak areas recorded."}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-100 dark:border-gray-600">
              <h4 className="text-base sm:text-lg font-bold text-amber-500 dark:text-amber-400 mb-2">
                Final Suggestions
              </h4>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {suggestionsText || "No suggestions recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* Question & Answer Breakdown Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[28px] p-6 sm:p-8 lg:p-10 shadow-xs border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900 rounded-xl border border-violet-100 dark:border-violet-700">
              <FaQuestionCircle className="text-violet-600 dark:text-violet-300 text-lg sm:text-xl" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
              Questions & Candidate Answers
            </h3>
          </div>

          <div className="space-y-8">
            {interview.questions && interview.questions.length > 0 ? (
              interview.questions.map((q, index) => {
                const answerText = q.answer || q.transcript;
                const hasAnswer = answerText && answerText.trim() !== "";

                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-5 sm:p-7 lg:p-8 border border-gray-200 dark:border-gray-600 space-y-6"
                  >
                    {/* Question Header & Inline Score Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="px-3 py-1 bg-violet-600 text-white font-bold text-xs sm:text-sm rounded-lg shrink-0 mt-0.5">
                          Q{index + 1}
                        </span>
                        <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white leading-snug">
                          {q.question || q}
                        </h4>
                      </div>

                      <div className="self-start sm:self-center shrink-0 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-violet-200 dark:border-slate-700 shadow-xs flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                          Score:
                        </span>
                        <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                          {q.score ?? "N/A"}
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/10</span>
                        </span>
                      </div>
                    </div>

                    {/* Candidate Answer Box */}
                    <div className="border-t border-gray-200 dark:border-gray-600/60 pt-4">
                      {hasAnswer ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-emerald-500 text-xs shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Candidate Answer:
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-700 italic leading-relaxed">
                            &ldquo;{answerText}&rdquo;
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FaExclamationCircle className="text-amber-500 text-xs shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Candidate Answer:
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-400 dark:text-gray-400 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-700 italic leading-relaxed">
                            No answer provided
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Merits & Demerits Full-Width Side-by-Side Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                      {/* Merits Card */}
                      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-emerald-200/60 dark:border-emerald-950/60 shadow-xs flex flex-col justify-start min-h-[160px]">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                          <FaPlusCircle className="text-emerald-500 text-sm shrink-0" />
                          <h5 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Merits
                          </h5>
                        </div>
                        {q.merits && q.merits.length > 0 ? (
                          <ul className="space-y-2.5 flex-1">
                            {q.merits.map((item, meritIndex) => (
                              <li
                                key={meritIndex}
                                className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 flex items-start gap-2.5 leading-snug"
                              >
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm sm:text-base font-medium text-gray-400 dark:text-gray-500 italic my-auto">
                            No merits recorded.
                          </p>
                        )}
                      </div>

                      {/* Demerits Card */}
                      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-red-200/60 dark:border-red-950/60 shadow-xs flex flex-col justify-start min-h-[160px]">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                          <FaMinusCircle className="text-red-500 text-sm shrink-0" />
                          <h5 className="text-sm sm:text-base font-black uppercase tracking-wider text-red-500 dark:text-red-400">
                            Demerits
                          </h5>
                        </div>
                        {q.demerits && q.demerits.length > 0 ? (
                          <ul className="space-y-2.5 flex-1">
                            {q.demerits.map((item, demeritIndex) => (
                              <li
                                key={demeritIndex}
                                className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 flex items-start gap-2.5 leading-snug"
                              >
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm sm:text-base font-medium text-gray-400 dark:text-gray-500 italic my-auto">
                            No demerits recorded.
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-4">
                No question breakdown logs available for this session.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default InterviewDetails;