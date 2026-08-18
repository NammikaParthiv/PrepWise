import axios from "../../utils/axios.js";
import { useEffect, useState } from "react";

const AdminStatistics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    resumesAnalysed: 0,
    interviewsTaken: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/admin/statistics");
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col text-slate-900 dark:text-slate-100 overflow-x-hidden">
      
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 gap-8 sm:gap-12">
        
        <div className="rounded-3xl border-2 sm:border-4 border-indigo-500 bg-amber-100 dark:border-green-500 dark:bg-indigo-800 py-10 sm:py-16 px-6 sm:px-16 shadow-2xl text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            📊 <span className="text-blue-500">PrepWise</span> Statistics
          </h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Real-time analytics of resumes, interviews, and user activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
          {[
            { icon: "📄", label: "Resumes Analyzed", value: stats.resumesAnalysed, color: "from-indigo-400 to-blue-600" },
            { icon: "🎙️", label: "Interviews Taken", value: stats.interviewsTaken, color: "from-purple-400 to-pink-600" },
            { icon: "👤", label: "Total Users", value: stats.totalUsers, color: "from-pink-400 to-red-500" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`group relative flex flex-col justify-center items-center p-8 sm:p-10 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-linear-to-br ${stat.color} transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden`}
            >
              {loading && (
                <div className="absolute inset-0 z-10 bg-white/20 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-4 border-white/70 border-t-transparent animate-spin"></div>
                </div>
              )}
              <div className="text-5xl sm:text-6xl mb-4 select-none drop-shadow-md">
                {stat.icon}
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-white uppercase tracking-widest text-center">
                {stat.label}
              </h3>
              <span className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-yellow-200 transition-colors duration-300">
                {loading ? "0" : stat.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminStatistics;
