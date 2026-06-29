import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500">
      
      <section className="relative overflow-hidden px-6 pt-32 pb-24 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-indigo-600/30 rounded-full blur-[150px] pointer-events-none" />
        
        <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter mb-8 bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent">
          PrepWise
        </h1>
        <p className="text-2xl md:text-3xl font-light italic max-w-2xl mx-auto mb-16 text-slate-300">
          "Good things take time, and consistency is the key to success, so don't loose hope and keep going"
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button 
            onClick={() => navigate("/register")}
            className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-3xl transition-all hover:scale-105"
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate("/login")}
            className="px-12 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xl rounded-3xl transition-all border border-slate-700"
          >
            Login
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-5xl font-black text-center mb-24">Your AI-Powered Success Engine</h2>
        
        <div className="grid gap-8">
          <div className="bg-slate-900/50 p-12 rounded-[3rem] border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col md:flex-row items-center gap-10">
            <div className="text-8xl">📄</div>
            <div>
              <h3 className="text-4xl font-bold mb-4">Smart Resume Analyser</h3>
              <p className="text-xl text-slate-300 leading-relaxed">
                Upload your resume to receive professional feedback. 
                <span className="block mt-4 font-bold text-indigo-400">Our system utilizes Gemini AI to evaluate your content against industry standards, ensuring your profile is ATS optimized and high-impact.</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-12 rounded-[3rem] border border-slate-800 hover:border-pink-500/50 transition-all flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="text-8xl">🎙️</div>
            <div>
              <h3 className="text-4xl font-bold mb-4">Precision Mock Interviews</h3>
              <p className="text-xl text-slate-300 leading-relaxed">
                Practice high-stakes interviews in a low-stress environment. 
                <span className="block mt-4 font-bold text-pink-400">Gemini AI acts as your personal interviewer, providing real-time evaluation of your technical accuracy, logic, and communication style.</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-12 rounded-[3rem] border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col md:flex-row items-center gap-10">
            <div className="text-8xl">💡</div>
            <div>
              <h3 className="text-4xl font-bold mb-4">Intelligent Verification</h3>
              <p className="text-xl text-slate-300 leading-relaxed">
                We believe in data-driven preparation. 
                <span className="block mt-4 font-bold text-emerald-400">Every response you provide is fact-checked and verified by Gemini AI, guaranteeing that your interview preparation is technically sound and logically bulletproof.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;