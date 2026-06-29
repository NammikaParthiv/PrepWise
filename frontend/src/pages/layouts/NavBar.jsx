import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../utils/axios.js";

function NavBar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/profile");
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <nav className="left-0 top-0 z-50 flex h-20 justify-between w-full bg-violet-600 text-white">
      <div>
        {(location.pathname === "/" || location.pathname ==="/u" || location.pathname==="/admin") ? (
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mt-4 ml-7 px-5 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 cursor-pointer
            ${
              darkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-slate-900 text-white hover:bg-slate-700"
            }`}
          >
            {darkMode ? "☀" : "🌙"}
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="mt-4 ml-4 px-5 py-2.5 flex items-center gap-2 rounded-full bg-orange-500 text-white font-semibold shadow-lg border border-orange-400 hover:bg-orange-600 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <span>⬅️</span>
            <span>Back</span>
          </button>
        )}
      </div>

      <div className="flex items-center ml-60">
        <h1 className="text-5xl p-2 font-handwritting">prepWise</h1>
        <img
          src="/logo.png"
          alt="prepWise Logo"
          className="p-2 rounded-full h-15"
        />
      </div>

      <div className="flex items-center mr-8">
        <h2 className="font-bold text-2xl"><span className="text-blue-200">{user?.name || "User"}</span></h2>

        <div className="relative">
          <img
            src={
              user?.profilePic_URL
                ? `http://localhost:2222${user.profilePic_URL}`
                : "/user.png"
            }
            alt="Profile"
            className="h-15 w-15 ml-5 rounded-full object-cover cursor-pointer border-2 border-white"
            onClick={() => setOpen(!open)}
          />

          {open && (
            <div className="absolute right-0 mt-2 z-10 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
              <button
                className="block w-full text-left px-4 py-4 text-black hover:bg-gray-200"
                onClick={() => navigate("/profile")}
              >
                Profile 👤
              </button>

              <button
                className="block w-full text-left px-4 py-4 text-black hover:bg-gray-200"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                Sign Out ➜
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
