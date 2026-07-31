import loginBG from "../assets/login.png";
import axios from "../utils/axios.js";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const previewUrl = location.state?.previewUrl;

  const submitHandle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/user/reset-password", {
        email,
        otp,
        newPassword,
      });

      alert(res.data.msg || "Password reset successful!");
      navigate("/login", { replace: true });
    } catch (error) {
      alert(error.response?.data?.msg || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${loginBG})`,
      }}
    >
      <div className="bg-white h-110 w-150 rounded-lg text-center opacity-50 flex flex-col justify-center items-center p-6">
        <h1 className="font-bold text-3xl mb-3 text-gray-900">Reset Password</h1>

        {previewUrl && (
          <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-900 px-4 py-2 rounded text-xs w-90">
            <span className="font-bold">Dev Mode: </span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700 font-bold hover:text-blue-900"
            >
              Click here to view your OTP Email ↗
            </a>
          </div>
        )}

        <form
          onSubmit={submitHandle}
          className="flex flex-col space-y-4 justify-center items-center w-full"
        >
          <input
            type="email"
            placeholder="Your Email"
            required
            value={email}
            className="border w-90 border-gray-700 text-gray-900 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="6-Digit OTP Code"
            required
            maxLength={6}
            className="border w-90 border-gray-700 text-gray-900 rounded py-2 px-4 text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            required
            minLength={6}
            className="border w-90 border-gray-700 text-gray-900 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white rounded px-7 py-3 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Update Password"}
          </button>
        </form>

        <p className="mt-4 text-gray-900">
          Back to{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;