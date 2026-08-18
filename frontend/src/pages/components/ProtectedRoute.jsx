import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/u"} replace />;
  }
  return <Outlet />;
  //renders which children is suited
}

export default ProtectedRoute;
