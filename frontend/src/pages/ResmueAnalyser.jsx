import Navbar from "./layouts/NavBar";
import axios from "../utils/axios.js";
import { useState } from "react";

function ResumeAnalyser() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadFiletext, setUploadFiletext] = useState("📄 Select Resume (PDF)");
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAnalysisResult(res.data.data);
    } catch (error) {
      console.log("Resume Upload Failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-linear-to-br from-orange-300 via-orange-100 to-yellow-200">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center my-12">
          <h1 className="text-6xl md:text-7xl font-black text-orange-900 tracking-tight">
            Resume Analyzer
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mt-4 font-medium">
            An AI-powered resume evaluation tool
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-2xl border border-orange-200 p-8 md:p-10 mb-12">
          <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            Resume Match Score
          </h2>

          <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Upload your resume and compare it against a job description to receive detailed AI-powered insights.
          </p>

          <div className="bg-orange-50 border-l-8 border-orange-500 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-orange-900 mb-2 flex items-center gap-2">
              <span>🔔</span> Important Instructions
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-md text-gray-700">
              <li>Upload your resume only in PDF format.</li>
              <li>Paste the complete job description.</li>
              <li>Longer and detailed job descriptions generally produce better results.</li>
            </ul>
          </div>

          <textarea
            placeholder="Paste the complete Job Description here..."
            value={jobDesc}
            disabled={loading}
            onChange={(e) => setJobDesc(e.target.value)}
            className="w-full h-64 p-6 text-lg rounded-2xl border-2 border-orange-200 shadow-inner resize-none focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
          />

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <label
              className={`flex items-center justify-center h-16 w-full sm:w-80 border-2 border-dashed border-orange-400 rounded-2xl bg-linear-to-r from-orange-50 to-yellow-50 font-semibold text-lg transition ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-orange-100 cursor-pointer"
              }`}
            >
              {uploadFiletext}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={loading}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setResume(e.target.files[0]);
                    setUploadFiletext(`📄 ${e.target.files[0].name}`);
                  }
                }}
              />
            </label>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto py-4 px-10 text-xl font-bold rounded-full text-white bg-linear-to-r from-orange-500 via-orange-600 to-red-500 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing Profile..." : "Analyze Now"}
            </button>
          </div>
        </div>
         {/* loading... */}
        {loading && (
          <div className="w-full bg-white rounded-3xl shadow-2xl border border-orange-100 p-8 md:p-10 animate-pulse space-y-8">
            <div className="h-40 bg-linear-to-r from-gray-200 to-gray-300 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <div className="h-6 w-48 bg-gray-400 rounded"></div>
              <div className="h-16 w-24 bg-gray-400 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-1/4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-1/4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        )}

        {!loading && analysisResult && (
          <div className="w-full bg-white rounded-3xl shadow-2xl border border-orange-200 p-8 md:p-10 transition-all duration-500 ease-out">
            <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
              Analysis Results
            </h2>

            <div className="bg-linear-to-r from-orange-500 via-orange-600 to-red-500 rounded-3xl p-8 text-center text-white mb-10 shadow-lg max-w-md mx-auto">
              <h3 className="text-2xl font-semibold mb-2">Resume Match Score</h3>
              <h1 className="text-7xl font-black tracking-tight">{analysisResult.score}%</h1>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="bg-green-50 border-l-8 border-green-500 rounded-2xl p-6 md:p-8 shadow-xs">
                <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  ✅ Strengths
                </h3>
                <ul className="list-disc pl-6 space-y-3 text-lg leading-relaxed text-gray-700">
                  {analysisResult.pros.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border-l-8 border-red-500 rounded-2xl p-6 md:p-8 shadow-xs">
                <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
                  ⚠️ Areas to Improve
                </h3>
                <ul className="list-disc pl-6 space-y-3 text-lg leading-relaxed text-gray-700">
                  {analysisResult.cons.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border-l-8 border-blue-500 rounded-2xl p-6 md:p-8 shadow-xs">
                <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  💡 Suggestions
                </h3>
                <ul className="list-disc pl-6 space-y-3 text-lg leading-relaxed text-gray-700">
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