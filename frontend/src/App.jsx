import UserHomePage from "./pages/UserHomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResumeAnalyser from "./pages/ResmueAnalyser";
import MockInterview from "./pages/MockInterview/MockInterview";
import Practise from "./pages/Practise";
import History from "./pages/history/History";
import ResumeDetials from "./pages/history/ResumeDetails";
import Profile from "./pages/Profile";
import InterviewSimulator from "./pages/MockInterview/InterviewSimulator";
import StudyPlanner from "./pages/StudyPlanner";
import InterviewReport from "./pages/MockInterview/InterviewReport";
import AdminHomePage from "./pages/admin/AdminHomePage";
import InterviewDetails from "./pages/history/InterviewDetails";
import AdminDashboard from "./pages/admin/AdminHomePage";
import { Routes, Route } from "react-router-dom";
function App(){
   return(
    <>
      <Routes>
        {/* <Route path='/' element={<UserHomePage />} /> */}
        <Route path="/" element={<AdminDashboard/>}/>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/resume_analyser' element={<ResumeAnalyser />} />
        <Route path='/interview_simulator' element={<InterviewSimulator />} />
        <Route path='/interview_simulator/session' element={<MockInterview />} />
        <Route path='/practise' element={<Practise />} />
        <Route path='/history' element={<History />} />
        <Route path='/study_planner' element={<StudyPlanner />} />
        <Route path='/admin' element={<AdminHomePage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/interview_simulator/result" element={<InterviewReport />}/>
        <Route path="/history/resume/:id" element={<ResumeDetials/>}/>
        <Route path="/history/interview/:id" element={<InterviewDetails/>}/>
      </Routes>
    </>
   );
}

export default App;