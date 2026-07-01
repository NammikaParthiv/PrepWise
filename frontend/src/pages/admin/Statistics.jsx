import Navbar from "../layouts/NavBar.jsx";
import axios from "../../utils/axios.js";
import { useEffect, useState } from "react";
const AdminStatistics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    resumesAnalysed: 0,
    interviewsTaken: 0,
  });
  useEffect(()=>{
    const fetchStats = async()=>{
      try{
        const response = await axios.get("/api/admin/statistics");
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col text-slate-100">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 py-12 gap-12">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-white/10 backdrop-blur-xl py-16 px-10 sm:px-16 shadow-2xl flex flex-col items-center text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-indigo-300 drop-shadow-lg">
            📊 <span className="text-yellow-300">PrepWise </span>Statistics
          </h1>
          <p className="mt-5 text-lg text-indigo-100 font-medium leading-relaxed max-w-2xl">
            Real-time analytics of resumes, interviews, and user activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: "📄", label: "Resumes Analyzed", value: stats.resumesAnalysed, color: "from-indigo-500 to-blue-600" },
            { icon: "🎙️", label: "Interviews Taken", value: stats.interviewsTaken, color: "from-purple-500 to-pink-600" },
            { icon: "👤", label: "Total Users", value: stats.totalUsers, color: "from-pink-500 to-red-600" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`group flex flex-col justify-center items-center p-10 rounded-3xl border border-white/20 shadow-lg bg-linear-to-br ${stat.color} transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
            >
              <div className="text-6xl mb-4 select-none drop-shadow-md">
                {stat.icon}
              </div>
              <h3 className="text-lg font-bold text-white/80 uppercase tracking-widest">
                {stat.label}
              </h3>
              <span className="mt-3 text-4xl font-black text-white tracking-tight group-hover:text-yellow-200 transition-colors duration-300">
                {stat.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminStatistics;
