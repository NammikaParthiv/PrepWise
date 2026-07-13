import Welcome from "./pages/Welcome";
import UserDashboard from "./pages/user/UserDashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NavBar from "./pages/layouts/NavBar";
import ResumeAnalyser from "./pages/user/ResmueAnalyser";
import MockInterview from "./pages/user/MockInterview/MockInterview";
import History from "./pages/user/history/History";
import ResumeDetials from "./pages/user/history/ResumeDetails";
import Profile from "./pages/Profile";
import InterviewSimulator from "./pages/user/MockInterview/InterviewSimulator";
import StudyPlanner from "./pages/user/StudyPlanner";
import InterviewReport from "./pages/user/MockInterview/InterviewReport";
import InterviewDetails from "./pages/user/history/InterviewDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Statistics from "./pages/admin/Statistics";
import References from "./pages/References";
import Users from "./pages/admin/UsersPage";
import ProtectedRoute from "./pages/components/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
function App() {
  const { user } = useAuth();
  return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white transition-colors duration-300">
        <NavBar />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/u" />
              )
            ) : (
              <Welcome />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Protected Routes */}

        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/u" element={<UserDashboard />} />
          <Route path="/u/resume_analyser" element={<ResumeAnalyser />} />
          <Route
            path="/u/interview_simulator"
            element={<InterviewSimulator />}
          />
          <Route
            path="/u/interview_simulator/session"
            element={<MockInterview />}
          />
          <Route path="/u/references" element={<References />} />
          <Route path="/u/history" element={<History />} />
          <Route path="/u/study_planner" element={<StudyPlanner />} />
          <Route path="/u/profile" element={<Profile />} />
          <Route
            path="/u/interview_simulator/result"
            element={<InterviewReport />}
          />
          <Route path="/u/history/resume/:id" element={<ResumeDetials />} />
          <Route
            path="/u/history/interview/:id"
            element={<InterviewDetails />}
          />
        </Route>

        {/* Admin Protected Routes */}

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/statistics" element={<Statistics />} />
          <Route path="/admin/references" element={<References />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Routes>
      </div>
  );
}

export default App;
