import loginBG from "../assets/login.png";
import axios from "../utils/axios.js";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showErrorAlert } from "../utils/errorMessage.js";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/user/forgot-password", { email });

      // Check if Ethereal link is there in backend
      if (res.data.previewUrl) {
        alert("OTP generated successfully. Open the Ethereal preview link on the next page to view your code.");
        // Pass previewUrl to the reset password page
        navigate("/reset-password", {
          state: {
            email,
            previewUrl: res.data.previewUrl,
          },
        });
      } else {
        navigate("/reset-password", { state: { email } });
      }
    } catch (error) {
      showErrorAlert(error, "Could not send OTP. Please try again.");
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
      <div className="bg-white h-100 w-150 rounded-lg text-center opacity-50 flex flex-col justify-center items-center">
        <h1 className="font-bold text-3xl m-6 text-gray-900">
          Forgot Password
        </h1>

        <p className="text-gray-900 text-sm mb-6 w-90">
          Enter your email address below and we’ll send a 6-digit OTP to your
          inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-6 justify-center items-center w-full"
        >
          <input
            type="email"
            placeholder="Enter your Email"
            required
            className="border w-90 border-gray-700 text-gray-900 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white rounded px-7 py-3 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="mt-6 text-gray-900">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
