import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import {
  FaPlus,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaEdit,
  FaTrashAlt,
  FaEllipsisV,
} from "react-icons/fa";
import { updateGoal, deleteGoal } from "../../utils/api";

import Sidebar from "../../components/main/SideBar";
import Header from "../../components/main/Header";
import DotsBackground from "../../components/main/DotsBackground";
import EditGoalModal from "../../components/main/modals/EditGoalModal";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [frequency, setFrequency] = useState(0);
  const [editGoalId, setEditGoalId] = useState(null);
  const [editFrequency, setEditFrequency] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState === "true";
  });

  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarCollapse = (e) => {
      if (e.detail) {
        setSidebarCollapsed(e.detail.collapsed);
      }
    };

    window.addEventListener("sidebar-collapse", handleSidebarCollapse);
    return () =>
      window.removeEventListener("sidebar-collapse", handleSidebarCollapse);
  }, []);

  const fetchGoals = async () => {
    if (!currentUser) return;

    try {
      const res = await api.get(`/goals?userId=${currentUser.id}`);
      setGoals(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch goals:",
        err?.response?.data || err.message
      );
    }
  };

  const createGoal = async () => {
    if (!newGoal.trim() || !currentUser) return;
    setIsLoading(true);

    try {
      await api.post("/goals", {
        title: newGoal,
        userId: Number(currentUser.id),
        frequency: Number(frequency),
      });

      setNewGoal("");
      setFrequency(0);
      fetchGoals();
    } catch (err) {
      console.error(
        "Failed to create goal:",
        err?.response?.data || err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGoal = async (updatedGoal) => {
    try {
      await updateGoal(updatedGoal.id, updatedGoal);
      fetchGoals();
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(goalId);
      // Remove the goal from the local state
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  const toggleMenu = (goalId) => {
    setShowMenuId(showMenuId === goalId ? null : goalId);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
    setShowMenuId(null);
  };

  const formatFrequency = (freq) => {
    if (freq === 0) return "Not scheduled";
    if (freq === 1) return "Daily";
    if (freq === 7) return "Weekly";
    if (freq === 14) return "Bi-weekly";
    if (freq === 30) return "Monthly";
    return `Every ${freq} days`;
  };

  const getFrequencyColor = (freq) => {
    if (freq === 0) return isDark ? "text-gray-400" : "text-gray-500";
    if (freq === 1) return isDark ? "text-green-400" : "text-green-600";
    if (freq === 7) return isDark ? "text-blue-400" : "text-blue-600";
    if (freq <= 14) return isDark ? "text-indigo-400" : "text-indigo-600";
    return isDark ? "text-purple-400" : "text-purple-600";
  };

  useEffect(() => {
    if (currentUser) {
      fetchGoals();
    }
  }, [currentUser]);

  return (
    <div
      className={`relative min-h-screen ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      } overflow-hidden`}
    >
      <DotsBackground />
      <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } relative z-10`}
      >
        <div className="flex-1 flex flex-col">
          <Header />

          <main className="p-6 space-y-4">
            <div
              className={`${
                isDark
                  ? "bg-zinc-900/70 border-indigo-500/20"
                  : "bg-white border-indigo-200/60"
              } backdrop-blur-sm rounded-xl p-6 border`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Create New Goal
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Enter your goal title"
                    className={`p-3 pl-4 rounded-lg ${
                      isDark
                        ? "bg-zinc-800 text-white border-zinc-700"
                        : "bg-gray-50 text-gray-900 border-gray-200"
                    } border w-full focus:outline-none focus:border-indigo-500 transition-colors`}
                  />
                </div>

                <div className="flex flex-shrink-0 gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <FaCalendarAlt
                        className={
                          isDark ? "text-indigo-400" : "text-indigo-600"
                        }
                      />
                    </div>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className={`pl-10 pr-4 py-3 rounded-lg ${
                        isDark
                          ? "bg-zinc-800 text-white border-zinc-700"
                          : "bg-gray-50 text-gray-900 border-gray-200"
                      } border appearance-none focus:outline-none focus:border-indigo-500 transition-colors`}
                    >
                      <option value="0">Not scheduled</option>
                      <option value="1">Daily</option>
                      <option value="7">Weekly</option>
                      <option value="14">Bi-weekly</option>
                      <option value="30">Monthly</option>
                    </select>
                  </div>

                  <button
                    onClick={createGoal}
                    disabled={isLoading || !newGoal.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[120px] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block animate-pulse">
                        Adding...
                      </span>
                    ) : (
                      <>
                        <FaPlus className="mr-2" /> Add Goal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {goals.length === 0 ? (
                <div
                  className={`${
                    isDark
                      ? "bg-zinc-900/70 border-indigo-500/20"
                      : "bg-white border-indigo-200/60"
                  } backdrop-blur-sm rounded-xl p-10 border text-center`}
                >
                  <div className="text-indigo-400 text-5xl mb-4">🎯</div>
                  <h3
                    className={`text-xl font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    No Goals Yet
                  </h3>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Create your first goal to start tracking your progress
                  </p>
                  <button
                    onClick={() =>
                      document.querySelector('input[type="text"]').focus()
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors mt-6"
                  >
                    <FaPlus className="inline mr-2" /> Create Your First Goal
                  </button>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`${
                      isDark
                        ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800/50"
                        : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
                    } p-6 rounded-xl shadow-lg border`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2
                        className={`text-xl font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {goal.title}
                      </h2>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm flex items-center gap-1 ${getFrequencyColor(
                            goal.frequency
                          )}`}
                        >
                          <FaCalendarAlt size={12} />
                          {formatFrequency(goal.frequency)}
                        </span>

                        <div className="relative">
                          <button
                            onClick={() => toggleMenu(goal.id)}
                            className={`${
                              isDark
                                ? "text-gray-400 hover:text-white"
                                : "text-gray-500 hover:text-gray-900"
                            } transition-colors p-1`}
                          >
                            <FaEllipsisV size={14} />
                          </button>

                          {showMenuId === goal.id && (
                            <div
                              className={`absolute z-10 right-0 mt-1 ${
                                isDark
                                  ? "bg-zinc-800 border-zinc-700"
                                  : "bg-white border-gray-200"
                              } border rounded-lg shadow-lg w-32 py-1`}
                            >
                              <button
                                onClick={() => handleEdit(goal)}
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                  isDark
                                    ? "text-blue-400 hover:bg-zinc-700"
                                    : "text-blue-600 hover:bg-gray-100"
                                } flex items-center gap-2`}
                              >
                                <FaEdit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                  isDark
                                    ? "text-red-400 hover:bg-zinc-700"
                                    : "text-red-600 hover:bg-gray-100"
                                } flex items-center gap-2`}
                              >
                                <FaTrashAlt size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div
                        className={`flex items-center gap-2 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <FaClock
                          size={14}
                          className={
                            isDark ? "text-indigo-400" : "text-indigo-600"
                          }
                        />
                        <span>
                          {goal.createdAt
                            ? `Created ${new Date(
                                goal.createdAt
                              ).toLocaleDateString()}`
                            : "Recently created"}
                        </span>
                      </div>
                    </div>

                    {goal.description && (
                      <p
                        className={`mt-3 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {goal.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateGoal}
        onDelete={handleDeleteGoal}
        goal={editingGoal}
      />
    </div>
  );
}
