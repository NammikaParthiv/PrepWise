import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../../utils/axios.js";

function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [queNo, setQueNo] = useState(1);
  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const interview = location.state?.interview;

  if (!interview) {
    navigate("/u/interview_simulator");
    return null;
  }

  const questions = interview.questions;

  const completeInterview = async (answers) => {
    setIsAnalyzing(true);
    try {
      const res = await axios.post("/api/interview/submit", {
        interviewId: interview._id,
        answers,
      });
      navigate("/u/interview_simulator/result", {
        replace: true,
        state: { interview: res.data.interview },
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.msg || "Failed to submit interview");
      setIsAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    const updatedAnswers = [...allAnswers];
    updatedAnswers[queNo - 1] = {
      question: questions[queNo - 1].question,
      answer: answer,
    };
    setAllAnswers(updatedAnswers);
    if (queNo < questions.length) {
      setQueNo((prev) => prev + 1);
      setAnswer("");
    } else {
      completeInterview(updatedAnswers);
    }
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
      navigate("/u/interview_simulator");
    }
  };

  const colors = {
    bg: isDarkMode ? "bg-slate-950" : "bg-amber-50",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    card: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-amber-200",
    inputBg: isDarkMode ? "bg-slate-900" : "bg-amber-100/50",
    buttonBg: isDarkMode ? "bg-slate-700" : "bg-amber-200",
    accent: isDarkMode ? "text-emerald-400" : "text-emerald-700",
  };

  if (isAnalyzing) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${colors.bg} ${colors.text}`}>
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-500 mb-8"></div>
        <h1 className="text-4xl font-black">Analyzing your answers...</h1>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-10 ${colors.bg} ${colors.text} transition-colors duration-500 pt-8`}>
      <div className="flex justify-between px-20 mb-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 cursor-pointer ${colors.buttonBg}`}
        >
          {isDarkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button
          onClick={handleExit}
          className="px-4 py-2 rounded-lg text-sm text-slate-500 border border-slate-300 hover:bg-slate-200 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          Exit Test ❌
        </button>
      </div>

      <div className="bg-slate-200 dark:bg-slate-800 h-5 rounded-lg mx-20 my-6 shadow-inner">
        <div className="bg-emerald-500 h-5 rounded-lg transition-all duration-500" style={{ width: `${(queNo / questions.length) * 100}%` }} />
      </div>

      <div className={`rounded-xl shadow-2xl mx-20 overflow-hidden border ${colors.card}`}>
        <h1 className="pl-10 pt-8 text-2xl font-bold opacity-80">Date {new Date().toLocaleDateString("en-GB")}</h1>
        <div className="flex justify-between px-10 pt-5">
          <h2 className="text-xl font-semibold">Role: {interview.job_role}</h2>
          <h2 className={`text-xl font-bold ${colors.accent}`}>Question {queNo}/{questions.length}</h2>
        </div>
        
        <div className={`rounded-lg p-10 m-10 border ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-amber-100 border-amber-200"}`}>
          <h2 className="text-3xl font-bold tracking-tight leading-relaxed">Q) {questions[queNo - 1].question}</h2>
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write your answer here..."
          className={`w-[95%] h-[350px] m-10 p-8 text-2xl font-medium rounded-lg resize-none focus:outline-none focus:ring-4 focus:ring-emerald-500 border ${colors.inputBg} ${isDarkMode ? "border-slate-600 placeholder-slate-500" : "border-amber-200 placeholder-slate-400"}`}
        />
        
        <div className="flex justify-center pb-10">
          <button
            onClick={nextQuestion}
            className="text-white text-xl px-12 py-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg"
          >
            {queNo < questions.length ? "Submit Answer" : "Submit Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MockInterview;