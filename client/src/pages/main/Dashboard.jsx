import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaFire,
  FaCalendarDay,
  FaExclamationTriangle,
} from "react-icons/fa";
import { updateSession, deleteSession } from "../../utils/api";

import Header from "../../components/main/Header";
import Sidebar from "../../components/main/SideBar";
import DotsBackground from "../../components/main/DotsBackground";
import GoalCard from "../../components/main/dashboard/GoalCard";
import SessionList from "../../components/main/dashboard/SessionList";
import AddSessionModal from "../../components/main/dashboard/AddSessionModal";
import EditSessionModal from "../../components/main/modals/EditSessionModal";
import EditGoalModal from "../../components/main/modals/EditGoalModal";
import ScheduledGoals from "../../components/main/dashboard/ScheduledGoals";
import GoalProgress from "../../components/main/dashboard/GoalProgress";
import SmartRecommendations from "../../components/main/dashboard/SmartRecommendations";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [scheduledGoals, setScheduledGoals] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const calculateCompletion = (sessions) => {
    if (!sessions.length) return 0;

    const completed = sessions.filter((s) => s.completed).length;
    return Math.round((completed / sessions.length) * 100);
  };

  const calculateStreak = (sessions) => {
    const dates = [
      ...new Set(sessions.map((s) => new Date(s.date).toDateString())),
    ];
    const sorted = dates.map((d) => new Date(d)).sort((a, b) => b - a);

    let streak = 0;
    let current = new Date();

    for (let date of sorted) {
      if (date.toDateString() === current.toDateString()) {
        streak++;
      } else if (
        date.toDateString() ===
        new Date(current.setDate(current.getDate() - 1)).toDateString()
      ) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    if (!currentUser) return;

    // Fetch all data when user is available
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      // Fetch all goals
      const goalsRes = await api.get(`/goals?userId=${currentUser.id}`);
      const userGoals = goalsRes.data;
      setGoals(userGoals);

      // Fetch sessions for each goal
      const allSessions = [];
      for (const goal of userGoals) {
        const sessionsRes = await api.get(`/sessions/goal/${goal.id}`);
        allSessions.push(...sessionsRes.data);
      }
      setSessions(allSessions);

      // Fetch scheduled goals
      const scheduledRes = await api.get(
        `/goals/scheduled?userId=${currentUser.id}`
      );
      setScheduledGoals(scheduledRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleAddSession = async (sessionData) => {
    try {
      // Post the new session
      const res = await api.post("/sessions", sessionData);
      setSessions((prev) => [res.data, ...prev]);

      // If session was completed, refresh scheduled goals
      if (sessionData.completed) {
        const scheduledRes = await api.get(
          `/goals/scheduled?userId=${currentUser.id}`
        );
        setScheduledGoals(scheduledRes.data);
      }
    } catch (err) {
      console.error("Error adding session:", err);
    }
    setShowModal(false);
  };

  const handleMarkGoalCompleted = async (goalId) => {
    try {
      // Get the goal title
      const goal = goals.find((g) => g.id === goalId);
      const goalTitle = goal ? goal.title : "Goal";

      // Create a completed session for this goal
      const sessionData = {
        goalId,
        title: `${goalTitle} completed`, // Use the goal title instead of "Quick completion"
        duration: 15, // Default duration
        date: new Date().toISOString(),
        completed: true,
      };

      // Post the new session
      const res = await api.post("/sessions", sessionData);

      // Refresh sessions
      setSessions((prev) => [res.data, ...prev]);

      // Refresh scheduled goals
      const scheduledRes = await api.get(
        `/goals/scheduled?userId=${currentUser.id}`
      );
      setScheduledGoals(scheduledRes.data);
    } catch (err) {
      console.error("Error marking goal as completed:", err);
    }
  };

  const handleMarkSessionCompleted = async (sessionId) => {
    try {
      // Update the session to mark it as completed
      const res = await api.put(`/sessions/${sessionId}`, {
        completed: true,
      });

      // Update the session in the local state
      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? res.data : session))
      );

      // Refresh scheduled goals
      const scheduledRes = await api.get(
        `/goals/scheduled?userId=${currentUser.id}`
      );
      setScheduledGoals(scheduledRes.data);
    } catch (err) {
      console.error("Error marking session as completed:", err);
    }
  };

  const handleUpdateSession = async (updatedSession) => {
    try {
      const res = await updateSession(updatedSession.id, updatedSession);

      // Update the session in the local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === updatedSession.id ? res.data : session
        )
      );

      // Refresh scheduled goals if needed
      if (updatedSession.completed) {
        const scheduledRes = await api.get(
          `/goals/scheduled?userId=${currentUser.id}`
        );
        setScheduledGoals(scheduledRes.data);
      }
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);

      // Remove the session from the local state
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      // Refresh scheduled goals
      const scheduledRes = await api.get(
        `/goals/scheduled?userId=${currentUser.id}`
      );
      setScheduledGoals(scheduledRes.data);
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsEditGoalModalOpen(true);
  };

  const handleUpdateGoal = async (updatedGoal) => {
    try {
      const res = await api.put(`/goals/${updatedGoal.id}`, updatedGoal);

      // Update the goal in the local state
      setGoals((prev) =>
        prev.map((goal) => (goal.id === updatedGoal.id ? res.data : goal))
      );

      // Refresh scheduled goals
      const scheduledRes = await api.get(
        `/goals/scheduled?userId=${currentUser.id}`
      );
      setScheduledGoals(scheduledRes.data);
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`);

      // Remove the goal from the local state
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));

      // Remove sessions associated with the goal
      setSessions((prev) =>
        prev.filter((session) => session.goalId !== goalId)
      );

      // Refresh scheduled goals
      const scheduledRes = await api.get(
        `/goals/scheduled?userId=${currentUser.id}`
      );
      setScheduledGoals(scheduledRes.data);
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  // Calculate progress for each goal for the current week
  const calculateGoalProgress = () => {
    if (!goals.length) return [];

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    return goals.map((goal) => {
      // Filter sessions for this goal in the current week
      const goalSessions = sessions.filter(
        (session) =>
          session.goalId === goal.id &&
          new Date(session.date) >= startOfWeek &&
          new Date(session.date) <= endOfWeek
      );

      // Count completed sessions
      const completedSessions = goalSessions.filter(
        (session) => session.completed
      ).length;

      // For now, let's set a default target of 5 sessions per week
      // In a real app, this would be configurable per goal
      const targetSessions = 5;

      return {
        ...goal,
        progress: completedSessions,
        target: targetSessions,
        percentage: Math.min(
          100,
          Math.round((completedSessions / targetSessions) * 100)
        ),
      };
    });
  };

  // Get sessions due today and missed sessions from previous days
  const getDailySummary = () => {
    if (!sessions.length && !scheduledGoals.length)
      return { todaySessions: [], missedSessions: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get sessions from today
    const todaySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    // Get missed sessions (sessions from previous days that aren't completed)
    const missedSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate < today && !session.completed;
    });

    // Include overdue scheduled goals as missed sessions
    const overdueGoals = scheduledGoals.filter(
      (goal) => goal.status === "overdue"
    );

    // Group today's sessions by goal
    const groupedTodaySessions = {};
    todaySessions.forEach((session) => {
      const goalId = session.goalId;
      if (!groupedTodaySessions[goalId]) {
        const goal = goals.find((g) => g.id === goalId);
        groupedTodaySessions[goalId] = {
          goal: goal || { title: "Unknown Goal" },
          sessions: [],
        };
      }
      groupedTodaySessions[goalId].sessions.push(session);
    });

    // Group missed sessions by goal
    const groupedMissedSessions = {};
    missedSessions.forEach((session) => {
      const goalId = session.goalId;
      if (!groupedMissedSessions[goalId]) {
        const goal = goals.find((g) => g.id === goalId);
        groupedMissedSessions[goalId] = {
          goal: goal || { title: "Unknown Goal" },
          sessions: [],
        };
      }
      groupedMissedSessions[goalId].sessions.push(session);
    });

    // Add overdue scheduled goals to missed sessions
    overdueGoals.forEach((goal) => {
      if (!groupedMissedSessions[goal.id]) {
        groupedMissedSessions[goal.id] = {
          goal: goal,
          sessions: [
            {
              id: `scheduled-${goal.id}`,
              title: `Scheduled ${goal.title}`,
              date: goal.nextDueDate,
              completed: false,
              isScheduledGoal: true,
              goalId: goal.id,
            },
          ],
        };
      }
    });

    return {
      todaySessions: Object.values(groupedTodaySessions),
      missedSessions: Object.values(groupedMissedSessions),
    };
  };

  const goalsWithProgress = calculateGoalProgress();
  const { todaySessions, missedSessions } = getDailySummary();

  // Add event listener for sidebar collapse
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

  // Get theme context
  const { isDark } = useTheme();

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
            {/* Daily Summary & Scheduled Tasks first (most important) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {/* Daily Summary - Always render the container even if no sessions */}
                <section
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
                    Daily Summary
                  </h2>

                  {todaySessions.length > 0 ? (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarDay className="text-blue-400" />
                        <h3 className="text-lg font-medium text-blue-400">
                          Today's Sessions
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {todaySessions.map((group, index) => (
                          <div
                            key={`today-${index}`}
                            className="bg-zinc-900 p-4 rounded-lg border border-white/10"
                          >
                            <h3 className="text-lg font-semibold mb-2 text-indigo-300">
                              {group.goal.title}
                            </h3>
                            <div className="space-y-2">
                              {group.sessions.map((session) => (
                                <div
                                  key={session.id}
                                  className={`p-3 rounded-lg flex justify-between items-center ${
                                    session.completed
                                      ? "bg-green-900/20 border border-green-500/30"
                                      : "bg-zinc-800"
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium">
                                      {session.title}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {new Date(
                                        session.date
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </div>
                                  <div>
                                    {session.completed ? (
                                      <span className="text-green-400 text-sm">
                                        Completed
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleMarkSessionCompleted(session.id)
                                        }
                                        className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                                      >
                                        Mark Complete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                      <p className="text-gray-400">
                        No sessions scheduled for today
                      </p>
                    </div>
                  )}

                  {/* Missed/Overdue Sessions second */}
                  {missedSessions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaExclamationTriangle className="text-red-400" />
                        <h3 className="text-lg font-medium text-red-400">
                          Overdue Sessions
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {missedSessions.map((group, index) => (
                          <div
                            key={`missed-${index}`}
                            className="bg-red-900/10 p-4 rounded-lg border border-red-500/30"
                          >
                            <h3 className="text-lg font-semibold mb-2 text-red-300">
                              {group.goal.title}
                            </h3>
                            <div className="space-y-2">
                              {group.sessions.map((session) => (
                                <div
                                  key={session.id}
                                  className="p-3 rounded-lg flex justify-between items-center bg-red-900/20"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {session.title}
                                    </div>
                                    <div className="text-xs text-red-300">
                                      Due:{" "}
                                      {new Date(
                                        session.date
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    {session.isScheduledGoal ? (
                                      <button
                                        onClick={() =>
                                          handleMarkGoalCompleted(
                                            session.goalId
                                          )
                                        }
                                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 rounded transition-colors"
                                      >
                                        Complete Goal
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleMarkSessionCompleted(session.id)
                                        }
                                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 rounded transition-colors"
                                      >
                                        Mark Complete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!todaySessions.length && !missedSessions.length && (
                    <div className="p-6 text-center">
                      <p className="text-gray-400">
                        No upcoming or overdue sessions
                      </p>
                    </div>
                  )}
                </section>

                {/* Goal progress cards - Always render section */}
                <section
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
                    Weekly Goal Progress
                  </h2>
                  {goalsWithProgress.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goalsWithProgress.map((goal) => (
                        <GoalProgress key={goal.id} goal={goal} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`p-4 ${
                        isDark
                          ? "bg-zinc-800/50 border-white/5"
                          : "bg-gray-50 border-gray-200/60"
                      } rounded-lg border flex flex-col items-center justify-center text-center`}
                    >
                      <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                        No goals with progress yet
                      </p>
                      <p
                        className={`${
                          isDark ? "text-gray-500" : "text-gray-500"
                        } text-sm mt-1`}
                      >
                        Create goals and track sessions to see your progress
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <GoalCard
                    goal={{ id: 0, title: "Active Goals" }}
                    title="Active Goals"
                    value={goals.length}
                    icon={<FaTachometerAlt size={20} />}
                    color="indigo"
                  />
                  <GoalCard
                    goal={{ id: 1, title: "Completion Rate" }}
                    title="Completion Rate"
                    value={`${calculateCompletion(sessions)}%`}
                    icon={<FaCheckCircle size={20} />}
                    color="green"
                  />
                  <GoalCard
                    goal={{ id: 2, title: "Current Streak" }}
                    title="Current Streak"
                    value={`${calculateStreak(sessions)} days`}
                    icon={<FaFire size={20} />}
                    color="yellow"
                  />
                  <GoalCard
                    goal={{ id: 3, title: "Sessions Today" }}
                    title="Sessions Today"
                    value={todaySessions.length}
                    icon={<FaCalendarDay size={20} />}
                    color={todaySessions.length > 0 ? "indigo" : "red"}
                  />
                </div>

                {/* Always render scheduled goals section */}
                <section
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
                    Scheduled Tasks
                  </h2>
                  {scheduledGoals.length > 0 ? (
                    <ScheduledGoals
                      goals={scheduledGoals}
                      onMarkCompleted={handleMarkGoalCompleted}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                    />
                  ) : (
                    <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                      <p className="text-gray-400">No scheduled tasks</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Schedule goals to see them here
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                {/* Smart Recommendations - Always render container */}
                <section
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
                    Smart Recommendations
                  </h2>
                  {sessions.length > 0 && goals.length > 0 ? (
                    <SmartRecommendations sessions={sessions} goals={goals} />
                  ) : (
                    <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                      <p className="text-gray-400">
                        Not enough data for recommendations
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Add more goals and complete sessions to get personalized
                        recommendations
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <div>
                <section
                  className={`${
                    isDark
                      ? "bg-zinc-900/70 border-indigo-500/20"
                      : "bg-white border-indigo-200/60"
                  } backdrop-blur-sm rounded-xl p-6 border`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2
                      className={`text-xl font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Recent Sessions
                    </h2>
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1"
                    >
                      <span>+</span> Add Session
                    </button>
                  </div>
                  {sessions.length > 0 ? (
                    <SessionList
                      sessions={sessions}
                      onMarkCompleted={handleMarkSessionCompleted}
                      onUpdate={handleUpdateSession}
                      onDelete={handleDeleteSession}
                      goals={goals}
                    />
                  ) : (
                    <div className="p-4 bg-zinc-800/50 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                      <p className="text-gray-400">No sessions yet</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Click "Add Session" to get started
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AddSessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddSession}
        goals={goals}
      />

      <EditGoalModal
        isOpen={isEditGoalModalOpen}
        onClose={() => setIsEditGoalModalOpen(false)}
        onSave={handleUpdateGoal}
        onDelete={handleDeleteGoal}
        goal={editingGoal}
      />
    </div>
  );
}
