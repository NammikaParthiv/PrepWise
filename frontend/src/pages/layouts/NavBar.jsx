import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeProvider";

function NavBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  
  return (
    <nav className="top-0 z-50 flex h-16 md:h-20 w-full items-center justify-between bg-violet-600 text-white px-4 md:px-8 shadow-md">
      <button
        onClick={() => setDarkMode(prev => !prev)}
        className={`p-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
          darkMode ? "bg-white text-black" : "bg-slate-900 text-white"
        }`}
      >
        {darkMode ? "☀" : "🌙"}
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <h1 className="text-2xl md:text-5xl font-handwritting">prepWise</h1>
        <img src="/logo.png" alt="Logo" className="hidden md:block p-2 rounded-full h-15" />
      </div>

      <div className="flex items-center">
        <h2 className="hidden md:block font-bold text-lg mr-4">
          <span className="text-blue-200">{user?.name || "User"}</span>
        </h2>
        
        <img
          src={user?.profilePic_URL ? `http://localhost:2222${user.profilePic_URL}` : "/user.png"}
          alt="Profile"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover cursor-pointer border-2 border-white"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="absolute top-16 right-4 w-40 bg-white text-black rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <button className="block w-full text-left px-4 py-3 hover:bg-gray-100" onClick={() => navigate("/u/profile")}>
              Profile 👤
            </button>
            <button 
              className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600" 
              onClick={() => {
                if(window.confirm("Are you sure you want to logout?")) {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
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