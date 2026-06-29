import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoute({ role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/u"} replace />;
  }
  return <Outlet />;
  //renders which children is suited
}

export default ProtectedRoute;
