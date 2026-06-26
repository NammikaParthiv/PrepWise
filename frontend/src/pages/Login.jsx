import loginBG from "../assets/login.png";
import axios from "../utils/axios.js";
import { useState } from "react";
import {useNavigate} from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const submitHandle = async(e)=>{
  e.preventDefault();

  console.log({
    email,
    password,
  });

  try {
    const res = await axios.post("/api/user/login",{
      email,
      password,
    });

    localStorage.setItem("token",res.data.token);

    console.log("Response",res.data);

    navigate("/");
  } catch (error) {
    console.log("Login Failed", error);
    console.log("Backend Response:", error.response?.data);

    alert(
      error.response?.data?.msg ||
      "Login Failed"
    );
  }
}
  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${loginBG})`,
        }}
      >
        <div className="bg-white h-100 w-150 rounded-lg text-center opacity-50">
          <h1 className="font-bold text-4xl m-10">Login</h1>
          <form 
          onSubmit={submitHandle}
          className="flex flex-col space-y-10 justify-center items-center">
            <input
              type="email"
              placeholder="Email"
              className="border w-90 border-gray-700 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e)=>setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e)=> setPassword(e.target.value)}
              className="border w-90 border-gray-700 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-600 text-white rounded px-7 py-3 mx-5 cursor-pointer"
            >
              Login
            </button>
          </form>
          <p className="mt-3">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
