import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeProvider";
import { FaArrowLeft } from "react-icons/fa";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const [open, setOpen] = useState(false);

  const path = location.pathname;
  const isExcluded = path === "/u" || path === "/admin";

  return (
    <nav className="top-0 z-50 flex h-16 md:h-20 w-full items-center justify-between bg-violet-600 text-white px-4 md:px-8 shadow-md">
      <div className="flex items-center gap-3">
        {!isExcluded && (
          <button
            onClick={() => navigate(-1)}
            className="group relative flex items-center justify-center p-2.5 md:px-5 md:py-3 rounded-xl font-bold bg-indigo-500 hover:bg-linear-to-r hover:from-orange-500 hover:to-amber-500 text-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-orange-500/50 active:scale-95 cursor-pointer overflow-hidden border border-violet-500 hover:border-orange-300/40"
            title="Go Back"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
            <FaArrowLeft className="text-lg md:mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="hidden md:inline tracking-wide">Back</span>
          </button>
        )}

        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className={`p-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
            darkMode ? "bg-white text-black" : "bg-slate-900 text-white"
          }`}
        >
          {darkMode ? "☀" : "🌙"}
        </button>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-pointer"
        onClick={() =>
          navigate(user.role === "user" ? "/u" : "/admin", { replace: true })
        }
      >
        <h1 className="text-2xl md:text-5xl font-handwritting">prepWise</h1>
        <img
          src="/logo.png"
          alt="Logo"
          className="hidden md:block p-2 rounded-full h-15"
        />
      </div>

      <div className="flex items-center">
        <h2 className="hidden md:block font-bold text-lg mr-4">
          <span className="text-blue-200">{user?.name || "User"}</span>
        </h2>

        <img
          src={user?.profilePic_URL || "/user.png"}
          alt="Profile"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover cursor-pointer border-2 border-white"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="absolute top-16 right-4 w-40 bg-white text-black rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {user?.role === "user" && (
              <button
                className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  navigate("/u/profile", { replace: path === "/u/profile" });
                }}
              >
                Profile 👤
              </button>
            )}

            <button
              className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setUser(null);
                  window.location.replace("/login");
                }
              }}
            >
              Sign Out ➜
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
