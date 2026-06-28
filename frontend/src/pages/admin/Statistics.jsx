import Navbar from "../layouts/NavBar.jsx";

const AdminStatistics = () => {

  const stats = {
    resumesAnalytic: 12345,
    interviewsTaken: 12345,
    totalUsers: 10000,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 py-12 gap-12">
        <div className="relative overflow-hidden rounded-4xl border-4 border-white bg-linear-to-br from-indigo-500 via-purple-600 to-pink-500 py-16 px-10 sm:px-16 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl drop-shadow-sm">
              System Statistics
            </h1>
            <p className="mt-5 text-xl text-purple-100 font-medium leading-relaxed">
              Real-time platform activity metrics, throughput performance of all the users
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 gap-10 md:grid-cols-3 min-h-[40vh]">
          
          <div className="group flex flex-col justify-center items-center p-12 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_30px_60px_rgba(99,102,241,0.12)]">
            <div className="text-7xl mb-6 select-none drop-shadow-md">
              📄
            </div>
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">
              Resumes Analyzed
            </h3>
            <span className="mt-4 text-6xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors duration-300">
              {stats.resumesAnalytic.toLocaleString()}
            </span>
          </div>

          <div className="group flex flex-col justify-center items-center p-12 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_30px_60px_rgba(168,85,247,0.12)]">
            <div className="text-7xl mb-6 select-none drop-shadow-md">
              🎙️
            </div>
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">
              Interviews Taken
            </h3>
            <span className="mt-4 text-6xl font-black text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors duration-300">
              {stats.interviewsTaken.toLocaleString()}
            </span>
          </div>

          <div className="group flex flex-col justify-center items-center p-12 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_30px_60px_rgba(236,72,153,0.12)]">
            <div className="text-7xl mb-6 select-none drop-shadow-md">
              👤
            </div>
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">
              Total Users
            </h3>
            <span className="mt-4 text-6xl font-black text-slate-900 tracking-tight group-hover:text-pink-500 transition-colors duration-300">
              {stats.totalUsers.toLocaleString()}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminStatistics;