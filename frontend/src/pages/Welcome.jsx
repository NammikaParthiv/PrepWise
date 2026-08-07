import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500 overflow-hidden">
      <section className="relative px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24 text-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 sm:w-150 h-72 sm:h-150 bg-indigo-600/30 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" />
        <h1 className="text-5xl sm:text-8xl md:text-[10rem] font-black tracking-tight sm:tracking-tighter mb-6 sm:mb-8 bg-linear-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
          PrepWise
        </h1>
        <p className="text-base sm:text-2xl md:text-3xl font-light italic max-w-xl sm:max-w-2xl mx-auto mb-10 sm:mb-16 text-slate-300 px-2 leading-relaxed">
          "Good things take time, and consistency is the key to success, so don't lose hope and keep going"
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 sm:gap-6 max-w-sm sm:max-w-none mx-auto">
          <button 
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base sm:text-xl rounded-2xl sm:rounded-3xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-slate-800 hover:bg-slate-700 text-white font-black text-base sm:text-xl rounded-2xl sm:rounded-3xl transition-all border border-slate-700 hover:border-slate-600 active:scale-95 cursor-pointer"
          >
            Login
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
        <h2 className="text-3xl sm:text-5xl font-black text-center mb-12 sm:mb-24 tracking-tight">
          Your AI-Powered Success Engine
        </h2>
        
        <div className="grid gap-6 sm:gap-8">  
          <div className="bg-slate-950/40 sm:bg-slate-900/50 backdrop-blur-md p-6 sm:p-12 rounded-2xl sm:rounded-[3rem] border border-slate-800/80 hover:border-indigo-500/50 transition-all flex flex-col md:flex-row items-center gap-6 sm:gap-10 text-center md:text-left">
            <div className="text-6xl sm:text-8xl shrink-0">📄</div>
            <div>
              <h3 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Smart Resume Analyser</h3>
              <p className="text-sm sm:text-xl text-slate-300 leading-relaxed">
                Upload your resume to receive professional feedback. 
                <span className="block mt-2.5 sm:mt-4 font-semibold sm:font-bold text-indigo-400">
                  Our system utilizes Gemini AI to evaluate your content against industry standards, ensuring your profile is ATS optimized and high-impact.
                </span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/40 sm:bg-slate-900/50 backdrop-blur-md p-6 sm:p-12 rounded-2xl sm:rounded-[3rem] border border-slate-800/80 hover:border-pink-500/50 transition-all flex flex-col md:flex-row-reverse items-center gap-6 sm:gap-10 text-center md:text-left">
            <div className="text-6xl sm:text-8xl shrink-0">🎙️</div>
            <div>
              <h3 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Precision Mock Interviews</h3>
              <p className="text-sm sm:text-xl text-slate-300 leading-relaxed">
                Practice high-stakes interviews in a low-stress environment. 
                <span className="block mt-2.5 sm:mt-4 font-semibold sm:font-bold text-pink-400">
                  Gemini AI acts as your personal interviewer, providing real-time evaluation of your technical accuracy, logic, and communication style.
                </span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/40 sm:bg-slate-900/50 backdrop-blur-md p-6 sm:p-12 rounded-2xl sm:rounded-[3rem] border border-slate-800/80 hover:border-emerald-500/50 transition-all flex flex-col md:flex-row items-center gap-6 sm:gap-10 text-center md:text-left">
            <div className="text-6xl sm:text-8xl shrink-0">💡</div>
            <div>
              <h3 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Intelligent Verification</h3>
              <p className="text-sm sm:text-xl text-slate-300 leading-relaxed">
                We believe in data-driven preparation. 
                <span className="block mt-2.5 sm:mt-4 font-semibold sm:font-bold text-emerald-400">
                  Every response you provide is fact-checked and verified by Gemini AI, guaranteeing that your interview preparation is technically sound and logically bulletproof.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;