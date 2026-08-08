import axios from "../../utils/axios.js";
import { useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaSpinner } from "react-icons/fa";

function ResumeAnalyser() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadFiletext, setUploadFiletext] = useState("Select Resume (PDF)");
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleSubmit = async () => {
    if (!resume || !jobDesc) {
      alert("Please select both resume and job description");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDesc);

    try {
      const res = await axios.post("/api/resume_analyser/addResume", formData, {
  headers: { "Content-Type": undefined },
});
      setAnalysisResult(res.data.data);
    } catch (error) {
      console.log("Resume Upload Failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 sm:pb-16 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/70 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-950 px-4 sm:px-6">
      {/* Changed max-w-4xl to max-w-6xl for a wider PC view, and pt-20/28 to pt-10/14 to reduce top gap */}
      <div className="max-w-6xl mx-auto pt-10 sm:pt-14">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 px-3.5 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/60 mb-3 shadow-xs">
            AI Tool
          </span>
          <h1 className="text-3xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Resume Analyzer
          </h1>
          <p className="text-sm sm:text-xl text-slate-600 dark:text-slate-300 mt-2 font-medium">
            AI-powered evaluation to match your resume with target jobs
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100 dark:border-slate-800 p-5 sm:p-10 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 text-center">
            Resume Match Score
          </h2>
          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 mb-6 text-center max-w-xl mx-auto">
            Upload your resume and paste the job description to receive deep insights and alignment scores.
          </p>

          {/* Instructions Box */}
          <div className="bg-orange-50/80 dark:bg-slate-800/80 border-l-4 border-orange-500 rounded-xl p-4 sm:p-5 mb-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <span className="font-bold text-orange-900 dark:text-orange-200 block mb-1">💡 Quick Guidelines:</span>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload resume strictly in <strong className="font-semibold">PDF</strong> format.</li>
              <li>Include the complete job role requirements for better accuracy.</li>
            </ul>
          </div>

          {/* Job Description Textarea */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Job Description
            </label>
            <textarea
              placeholder="Paste the complete Job Description here..."
              value={jobDesc}
              disabled={loading}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full h-44 sm:h-56 p-4 sm:p-5 text-sm sm:text-base rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition disabled:opacity-60 disabled:cursor-not-allowed text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Actions Container */}
          <div className="flex flex-col gap-3.5 sm:flex-row sm:gap-4 justify-between items-center">
            {/* Upload File Button */}
            <label
              className={`flex items-center justify-center gap-2.5 h-14 w-full sm:w-auto sm:flex-1 border-2 border-dashed border-orange-300 dark:border-slate-700 rounded-xl sm:rounded-2xl bg-orange-50/40 dark:bg-slate-800/50 font-semibold text-xs sm:text-sm px-4 text-orange-900 dark:text-orange-200 transition ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-orange-100/60 dark:hover:bg-slate-800 cursor-pointer"
              }`}
            >
              <FaFilePdf className="text-orange-600 dark:text-orange-400 text-lg shrink-0" />
              <span className="truncate">{uploadFiletext}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={loading}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setResume(e.target.files[0]);
                    setUploadFiletext(e.target.files[0].name);
                  }
                }}
              />
            </label>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto h-14 px-8 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="text-lg" />
                  <span>Analyze Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 animate-pulse space-y-6">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2">
              <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
              <div className="h-10 w-20 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && analysisResult && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl border border-orange-200/60 dark:border-slate-800 p-5 sm:p-10 transition-all duration-500 space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-4xl font-black text-center text-slate-900 dark:text-white">
              Analysis Results
            </h2>

            {/* Score Card */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-white shadow-md max-w-xs mx-auto">
              <h3 className="text-xs sm:text-base font-semibold uppercase tracking-wider mb-1 opacity-90">
                Match Score
              </h3>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight">
                {analysisResult.score}%
              </h1>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6">
              
              {/* Strengths */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-emerald-500 rounded-xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Strengths
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
                  {analysisResult.pros.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-rose-500 rounded-xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-lg sm:text-xl font-bold text-rose-800 dark:text-rose-300 mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-rose-500 dark:text-rose-400 shrink-0" /> Areas to Improve
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
                  {analysisResult.cons.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="bg-sky-50/70 dark:bg-sky-950/30 border-l-4 border-sky-500 rounded-xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-lg sm:text-xl font-bold text-sky-800 dark:text-sky-300 mb-3 flex items-center gap-2">
                  <FaLightbulb className="text-sky-500 dark:text-sky-400 shrink-0" /> Suggestions
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
                  {analysisResult.needImprove.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyser;