import { Navigate } from "react-router-dom";

const allowedRoles = ["admin", "meet_manager", "data_entry_operator"];

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
