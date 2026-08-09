import loginBG from "../assets/login.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios.js";

function Register() {
  const navigate = useNavigate();
  const [name,setName] = useState("");
  const [email, setEmail] = useState("");
  const [password,setPassword] = useState("");

  const submitHandle = async (e)=>{
    e.preventDefault();
    try {
      const res = await axios.post("/api/user/register", {
        name,
        email,
        password,
      });
      alert(res.data.msg);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.msg || "Registration failed");
    }
  }

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
        style={{
          backgroundImage: `url(${loginBG})`,
        }}
      >
        <div className="bg-white h-130 w-full sm:w-150 rounded-lg text-center opacity-50 flex flex-col justify-center items-center p-6">
          <h1 className="font-bold text-4xl mb-2 text-gray-900">Register</h1>
          <p className="mb-5 text-gray-900 font-semibold">Fill the following details</p>
          <form 
            onSubmit={submitHandle}
            className="flex flex-col space-y-6 justify-center items-center w-full"
          >
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              className="border w-90 max-w-full font-semibold placeholder:text-black text-gray-900 border-gray-700 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="border w-90 max-w-full border-gray-700 placeholder:text-black text-gray-900 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
              className="border w-90 max-w-full border-gray-700 placeholder:text-black text-gray-900 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-600 text-white rounded px-7 py-3 mx-5 cursor-pointer font-semibold"
            >
              Register
            </button>
          </form>
          <p className="mt-3 text-gray-900">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-semibold">
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;