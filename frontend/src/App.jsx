import Welcome from "./pages/Welcome";
import UserDashboard from "./pages/UserDashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResumeAnalyser from "./pages/ResmueAnalyser";
import MockInterview from "./pages/MockInterview/MockInterview";
import History from "./pages/history/History";
import ResumeDetials from "./pages/history/ResumeDetails";
import Profile from "./pages/Profile";
import InterviewSimulator from "./pages/MockInterview/InterviewSimulator";
import StudyPlanner from "./pages/StudyPlanner";
import InterviewReport from "./pages/MockInterview/InterviewReport";
import InterviewDetails from "./pages/history/InterviewDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Statistics from "./pages/admin/Statistics";
import AddReferences from "./pages/admin/AddReferences";
import Users from "./pages/admin/UsersPage";
import ProtectedRoute from "./pages/components/ProtectedRoute";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Protected Routes */}

        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/u" element={<UserDashboard />} />
          <Route path="/u/resume_analyser" element={<ResumeAnalyser />} />
          <Route path="/u/interview_simulator" element={<InterviewSimulator />} />
          <Route
            path="/u/interview_simulator/session"
            element={<MockInterview />}
          />
          <Route path="/u/history" element={<History />} />
          <Route path="/u/study_planner" element={<StudyPlanner />} />
          <Route path="/u/profile" element={<Profile />} />
          <Route
            path="/u/interview_simulator/result"
            element={<InterviewReport />}
          />
          <Route path="/u/history/resume/:id" element={<ResumeDetials />} />
          <Route path="/u/history/interview/:id" element={<InterviewDetails />} />
        </Route>

        {/* Admin Protected Routes */}

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/statistics" element={<Statistics />} />
          <Route path="/admin/add_references" element={<AddReferences />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
