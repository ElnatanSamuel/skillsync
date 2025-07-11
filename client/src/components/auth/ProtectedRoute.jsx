import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { currentUser, loading, authChecked } = useAuth();

  // If auth is being checked, show loading spinner
  if (!authChecked) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!loading && !currentUser) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
