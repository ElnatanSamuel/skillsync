import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("goals")) return "Goals";
    if (path.includes("calendar")) return "Calendar";
    return "SkillSync";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-gradient-to-r from-zinc-900 to-zinc-950 text-white py-4 px-6 flex justify-between items-center sticky top-0 z-20 border-b border-indigo-500/10 shadow-md">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
        <div className="h-6 w-px bg-indigo-500/20 mx-4"></div>
        <span className="text-sm text-gray-400">Track your progress</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-800/70 border border-zinc-700">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FaUser size={12} className="text-white" />
          </div>

          {currentUser && (
            <div className="text-sm">
              <span className="text-gray-300 font-medium">
                {currentUser.email.split("@")[0]}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="ml-1 p-1.5 rounded-full hover:bg-zinc-700 text-gray-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <FaSignOutAlt size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
