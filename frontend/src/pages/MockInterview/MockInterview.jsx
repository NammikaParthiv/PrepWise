import NavBar from "../layouts/NavBar";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "../../utils/axios.js";

function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();
   const [queNo, setQueNo] = useState(1);
  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const interview = location.state?.interview;

  if (!interview) {
    navigate("/u/interview_simulator");
    return null;
  }

  const questions = interview.questions;

  const completeInterview = async (answers) => {
    try {
      const res = await axios.post("/api/interview/submit", {
        interviewId: interview._id,
        answers,
      });

      navigate("/u/interview_simulator/result", {
        replace: true,
        state: {
          interview: res.data.interview,
        },
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.msg || "Failed to submit interview");
    }
  };

  const nextQuestion = () => {
    // if (!answer.trim()) {
    //   alert("Please enter an answer");
    //   return;
    // }

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

  return (
    <div className="min-h-screen pb-10 bg-linear-to-r from-violet-300 via-violet-200 to-violet-300">
      <NavBar />

      {/* Progress */}
      <div className="bg-gray-500 h-5 rounded-lg mx-20 my-20">
        <div
          className="bg-green-500 h-5 rounded-lg"
          style={{
            width: `${(queNo / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-xl mx-20 overflow-hidden">

        <h1 className="pl-10 pt-8 text-2xl font-bold">
          Date{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h1>

        <div className="flex justify-between px-10 pt-5">

          <h2 className="text-2xl font-semibold">
            Role : {interview.job_role}
          </h2>

          <h2 className="text-2xl font-semibold text-blue-600">
            Question {queNo}/{questions.length}
          </h2>

        </div>

        <div className="border-2 bg-gray-300 rounded-lg p-8 m-10">

          <h2 className="text-2xl font-semibold">
            Q) {questions[queNo - 1].question}
          </h2>

        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write your answer here..."
          className="w-[95%] h-80 m-10 p-8 text-xl rounded-lg border-2 border-gray-400 bg-gray-200 resize-none"
        />

        <div className="flex justify-center pb-10">

          <button
            onClick={nextQuestion}
            className="bg-violet-600 hover:bg-violet-700 transition text-white text-xl px-8 py-3 rounded-xl cursor-pointer"
          >
            {queNo < questions.length ? "Next Question" : "End Test"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default MockInterview;