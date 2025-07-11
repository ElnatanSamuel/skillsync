import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import { updateSession, deleteSession } from "../../utils/api";

import Header from "../../components/main/Header";
import Sidebar from "../../components/main/SideBar";
import DotsBackground from "../../components/main/DotsBackground";
import CalendarView from "../../components/main/calendar/CalendarView";
import DateDetail from "../../components/main/calendar/DateDetail";

const Calendar = () => {
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sessionsForDate, setSessionsForDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState === "true";
  });
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

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

  useEffect(() => {
    if (!currentUser) return;

    // Fetch all data when user is available
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);

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

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const handleDateClick = (date, sessionsOnDate) => {
    setSelectedDate(date);
    setSessionsForDate(sessionsOnDate);
  };

  const handleAddSession = async (sessionData) => {
    try {
      // Add goal ID - for simplicity, we'll use the first goal
      // In a real app, you'd want to let the user select which goal
      if (goals.length > 0) {
        sessionData.goalId = goals[0].id;
      } else {
        alert("You need to create a goal first");
        return;
      }

      // Post the new session
      const res = await api.post("/sessions", sessionData);

      // Update sessions list
      setSessions((prev) => [res.data, ...prev]);

      // Update sessions for the selected date
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const sessionDate = new Date(res.data.date).toISOString().split("T")[0];

        if (dateStr === sessionDate) {
          setSessionsForDate((prev) => [...prev, res.data]);
        }
      }
    } catch (err) {
      console.error("Error adding session:", err);
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

      // Update sessions for the selected date
      setSessionsForDate((prev) =>
        prev.map((session) => (session.id === sessionId ? res.data : session))
      );
    } catch (err) {
      console.error("Error marking session as completed:", err);
    }
  };

  const handleUpdateSession = async (updatedSession) => {
    try {
      const res = await updateSession(updatedSession.id, updatedSession);

      // Update the session in the main sessions list
      setSessions((prev) =>
        prev.map((session) =>
          session.id === updatedSession.id ? res.data : session
        )
      );

      // Update sessions for the selected date
      setSessionsForDate((prev) =>
        prev.map((session) =>
          session.id === updatedSession.id ? res.data : session
        )
      );
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);

      // Remove the session from the main sessions list
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      // Remove the session from the selected date sessions
      setSessionsForDate((prev) =>
        prev.filter((session) => session.id !== sessionId)
      );
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

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
          <main className="p-6">
            <h1
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Session Calendar
            </h1>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <CalendarView
                    sessions={sessions}
                    onDateClick={handleDateClick}
                    onAddSession={(date) => {
                      setSelectedDate(date);
                      setSessionsForDate(
                        sessions.filter((session) => {
                          const sessionDate = new Date(session.date);
                          return (
                            sessionDate.toDateString() === date.toDateString()
                          );
                        })
                      );
                    }}
                  />
                </div>
                <div>
                  <DateDetail
                    date={selectedDate}
                    sessions={sessionsForDate}
                    goals={goals}
                    onAddSession={handleAddSession}
                    onMarkCompleted={handleMarkSessionCompleted}
                    onUpdateSession={handleUpdateSession}
                    onDeleteSession={handleDeleteSession}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
