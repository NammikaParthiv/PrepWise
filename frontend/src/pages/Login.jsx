import loginBG from "../assets/login.png";
import axios from "../utils/axios.js";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { getErrorMessage } from "../utils/errorMessage.js";

function Login() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/u", { replace: true });
      }
    }
  }, [user, navigate]);

  const submitHandle = async (e) => {
    e.preventDefault();
    setPasswordError("");
    try {
      const res = await axios.post("/api/user/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (setUser) setUser(res.data.user);

      if (res.data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/u", { replace: true });
      }
    } catch (error) {
      if (error.response?.data?.field === "password") {
        setPasswordError(error.response.data.msg || "Wrong password. Please try again.");
        return;
      }

      if (error.response?.status === 404) {
        alert(error.response?.data?.msg || "No account exists with this email address.");
        return;
      }

      alert(getErrorMessage(error, "Login failed. Please try again."));
    }
  };

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
        style={{
          backgroundImage: `url(${loginBG})`,
        }}
      >
        <div className="bg-white h-100 w-full sm:w-150 rounded-lg text-center opacity-50 flex flex-col justify-center items-center p-6">
          <h1 className="font-bold text-4xl mb-6 text-gray-900">Login</h1>
          <form
            onSubmit={submitHandle}
            className="flex flex-col space-y-6 justify-center items-center w-full"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              className="border w-90 max-w-full border-gray-700 text-gray-900 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="w-90 max-w-full">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                className={`border w-full text-gray-900 rounded py-2 px-4 focus:outline-none focus:ring-2 ${
                  passwordError
                    ? "border-red-600 focus:ring-red-500"
                    : "border-gray-700 focus:ring-blue-500"
                }`}
              />
              {passwordError && (
                <p className="text-left text-red-700 text-sm font-semibold mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="w-90 max-w-full text-right -mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white rounded px-7 py-3 mx-5 cursor-pointer"
            >
              Login
            </button>
          </form>
          <p className="mt-3 text-gray-900">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
