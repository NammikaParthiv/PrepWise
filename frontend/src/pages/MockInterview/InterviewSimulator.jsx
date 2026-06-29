import Navbar from "../layouts/NavBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios.js";

function InterviewSimulator() {
  const navigate = useNavigate();
  const [role,setRole] = useState("");
  const [loading,setLoading] = useState(false);
  const stratInterview = async()=>{
    if(!role){
      alert("Plases selct a job role");
      return;
    }
    try {
      setLoading(true);
       const res = await axios.post("/api/interview/generate",{
        job_role:role,
       });
       navigate("/u/interview_simulator/session",
        {
          state:{
            interview : res.data.interview,
          }
        }
       );
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

   alert(
      error.response?.data?.msg ||
      error.message)
    }finally{
      setLoading(false);
    }
  }
  return(
    <div className="min-h-screen bg-linear-to-br from-blue-500 via-blue-200 to-indigo-500 pb-20">
        <Navbar />
        <h1 className="text-4xl font-bold p-5 bg-linear-to-r  from-blue-500 to-violet-600 text-white rounded-2xl shadow-2xl text-center w-90 my-10 mx-auto">Mock Interview</h1>
        <div className="w-3/4 h-1/2 bg-amber-300 mx-auto flex flex-col shadow-2xl rounded border-2 p-10 m-20 tems-center">
        <p className="text-2xl mx-5">Select your job role for giving the interview:</p>
           <select 
           value={role}
           onChange={(e)=> setRole(e.target.value)}
           className="border-2 border-indigo-500  w-3/4 rounded-lg p-4 m-5 text-xl">
              <option value="">Select</option>
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Developer</option>
              <option value="fullstack">MERN Full Stack Developer</option>
              <option value="dsa">Data Sturctures and Algorithm theory</option>
              {/* <option value="data-science">Data Scientist</option> */}
              {/* <option value="devops">DevOps Engineer</option> */}
           </select>
           <div className="text-center bg-gray-200 p-8 border border-gray-500  rounded-xl mt-10">
            <p className="text-3xl font-bold">🔔This interview will contain:</p>
            <ul className="text-xl inline-block font-semibold text-left list-disc list-inside mt-5">
            <li> ✅ Technical questions</li>
            <li> ✅ Conceptual questions</li>
            <li> ✅ real-interview style questions</li>
            <li> ✅ AI evaluation and feedback</li>
            </ul>
           </div>
           <p className="text-xl text-center mt-7">Click here to start the interview</p>
           <button type="button"
           disabled={loading}
           className={`self-center text-white px-8 py-4 text-xl rounded-lg mt-5
            ${
              loading ? "bg-green-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 cursor-pointer"
            }
            `}
           onClick={stratInterview}>{loading? "Generating questions...": "Start"}</button>
        </div>
    </div>
  )
}

export default InterviewSimulator;