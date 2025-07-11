import React, { useState, useEffect } from "react";
import Header from "../../components/main/Header";
import SideBar from "../../components/main/SideBar";
import DotsBackground from "../../components/main/DotsBackground";
import ProgressChart from "../../components/main/analytics/ProgressChart";
import StreakChart from "../../components/main/analytics/StreakChart";
import SkillRadarChart from "../../components/main/analytics/SkillRadarChart";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";

const Analytics = () => {
  // const navigate = useNavigate(); // Removed unused variable
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [streakData, setStreakData] = useState([]);
  const [skillData, setSkillData] = useState([]);
  const [timeRange, setTimeRange] = useState("week"); // 'week', 'month', 'year'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    completedSessions: 0,
    currentStreak: 0,
    totalHours: 0,
  });

  useEffect(() => {
    // Listen for sidebar collapse events
    const handleSidebarCollapse = (e) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebar-collapse", handleSidebarCollapse);

    // Initialize from localStorage on mount
    const savedState = localStorage.getItem("sidebar-collapsed");
    setSidebarCollapsed(savedState === "true");

    return () => {
      window.removeEventListener("sidebar-collapse", handleSidebarCollapse);
    };
  }, []);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Get userId from localStorage
        const userId = localStorage.getItem("userId");

        if (!userId) {
          throw new Error("User ID not found");
        }

        // Fetch real data from API with userId
        const goalsResponse = await api.get("/goals", {
          params: { userId },
        });
        const goals = goalsResponse.data;

        const sessionsResponse = await api.get("/sessions", {
          params: { userId },
        });
        const sessions = sessionsResponse.data;

        // Process data based on time range
        const processedData = processDataByTimeRange(sessions, timeRange);
        setProgressData(processedData.progressData);
        setStreakData(processedData.streakData);

        // Process skill data from goals
        const processedSkillData = processSkillData(goals, sessions);
        setSkillData(processedSkillData);

        // Calculate stats
        const calculatedStats = calculateStats(sessions);
        setStats(calculatedStats);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        showToast("Failed to load analytics data", "error");

        // Fallback to sample data if API call fails
        const sampleData = getSampleData(timeRange);
        setProgressData(sampleData.progressData);
        setStreakData(sampleData.streakData);
        setSkillData(sampleData.skillData);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, showToast]);

  // Process real session data by time range
  const processDataByTimeRange = (sessions, range) => {
    if (!sessions || sessions.length === 0) {
      return getSampleData(range);
    }

    // Sort sessions by date
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let progressData = [];
    let streakData = [];

    if (range === "week") {
      // Group sessions by day of week
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = Array(7)
        .fill()
        .map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - d.getDay() + i);
          return d;
        });

      progressData = days.map((day) => {
        const dayStr = day.toISOString().split("T")[0];
        const daySessions = sortedSessions.filter(
          (s) => s.date.split("T")[0] === dayStr
        );

        return {
          name: dayNames[day.getDay()],
          completed: daySessions.filter((s) => s.completed).length,
          target: Math.max(5, daySessions.length), // Target at least 5 or actual session count
        };
      });

      // Calculate streaks by day
      streakData = days.map((day) => {
        const dayStr = day.toISOString().split("T")[0];
        const hasCompletedSession = sortedSessions.some(
          (s) => s.date.split("T")[0] === dayStr && s.completed
        );

        return {
          date: dayNames[day.getDay()],
          streak: hasCompletedSession ? 1 : 0,
        };
      });
    } else if (range === "month") {
      // Group by week of month
      const weeks = Array(4)
        .fill()
        .map((_, i) => `Week ${i + 1}`);

      progressData = weeks.map((weekName) => {
        const weekIndex = parseInt(weekName.split(" ")[1]) - 1;
        const weekSessions = sortedSessions.filter((s) => {
          const sessionDate = new Date(s.date);
          const weekOfMonth = Math.floor((sessionDate.getDate() - 1) / 7);
          return weekOfMonth === weekIndex;
        });

        return {
          name: weekName,
          completed: weekSessions.filter((s) => s.completed).length,
          target: Math.max(20, weekSessions.length), // Target at least 20 or actual session count
        };
      });

      // Calculate streaks by week
      streakData = weeks.map((weekName) => {
        const weekIndex = parseInt(weekName.split(" ")[1]) - 1;
        const weekSessions = sortedSessions.filter((s) => {
          const sessionDate = new Date(s.date);
          const weekOfMonth = Math.floor((sessionDate.getDate() - 1) / 7);
          return weekOfMonth === weekIndex;
        });

        const completedCount = weekSessions.filter((s) => s.completed).length;

        return {
          date: weekName,
          streak: completedCount,
        };
      });
    } else {
      // Group by month for yearly view
      const months = Array(12)
        .fill()
        .map((_, i) =>
          new Date(0, i).toLocaleString("default", { month: "short" })
        );

      progressData = months.map((month) => {
        const monthIndex = months.indexOf(month);
        const monthSessions = sortedSessions.filter((s) => {
          const sessionDate = new Date(s.date);
          return sessionDate.getMonth() === monthIndex;
        });

        return {
          name: month,
          completed: monthSessions.filter((s) => s.completed).length,
          target: Math.max(80, monthSessions.length), // Target at least 80 or actual session count
        };
      });

      // Calculate streaks by month
      streakData = months.map((month) => {
        const monthIndex = months.indexOf(month);
        const monthSessions = sortedSessions.filter((s) => {
          const sessionDate = new Date(s.date);
          return sessionDate.getMonth() === monthIndex;
        });

        const completedCount = monthSessions.filter((s) => s.completed).length;

        return {
          date: month,
          streak: completedCount,
        };
      });
    }

    return { progressData, streakData };
  };

  // Process skill data from goals and sessions
  const processSkillData = (goals, sessions) => {
    if (!goals || goals.length === 0) {
      return [];
    }

    // Group goals by skill/title
    const skillMap = new Map();

    goals.forEach((goal) => {
      // Use goal.category if available, otherwise use goal.title as the skill
      const skill = goal.category || goal.title;

      if (!skill) return;

      if (!skillMap.has(skill)) {
        skillMap.set(skill, {
          goals: [goal],
          completedSessions: 0,
          totalSessions: 0,
        });
      } else {
        skillMap.get(skill).goals.push(goal);
      }
    });

    // If no skills found, return empty array
    if (skillMap.size === 0) {
      return [];
    }

    // Count sessions for each skill
    sessions.forEach((session) => {
      skillMap.forEach((data) => {
        if (data.goals.some((goal) => goal.id === session.goalId)) {
          data.totalSessions++;
          if (session.completed) {
            data.completedSessions++;
          }
        }
      });
    });

    // Convert map to array of skills with values
    return Array.from(skillMap.entries()).map(([skill, data]) => {
      const completionRate =
        data.totalSessions > 0
          ? Math.round((data.completedSessions / data.totalSessions) * 100)
          : 50; // Default to 50% if no sessions

      return {
        subject: skill,
        value: completionRate,
        target: 100, // Target is always 100%
      };
    });
  };

  // Calculate stats from sessions
  const calculateStats = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return {
        completedSessions: 0,
        currentStreak: 0,
        totalHours: 0,
      };
    }

    // Completed sessions count
    const completedSessions = sessions.filter((s) => s.completed).length;

    // Calculate current streak
    const sessionsByDate = {};
    sessions.forEach((session) => {
      const dateStr = new Date(session.date).toDateString();
      if (!sessionsByDate[dateStr]) {
        sessionsByDate[dateStr] = [];
      }
      sessionsByDate[dateStr].push(session);
    });

    const dates = Object.keys(sessionsByDate)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b - a); // Sort descending

    let currentStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      date.setHours(0, 0, 0, 0);

      // Check if this date is part of the streak
      const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

      if (
        dayDiff === i &&
        sessionsByDate[date.toDateString()].some((s) => s.completed)
      ) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate total hours
    const totalMinutes = sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);

    const totalHours = Math.round(totalMinutes / 60);

    return {
      completedSessions,
      currentStreak,
      totalHours,
    };
  };

  // Fallback sample data
  const getSampleData = (range) => {
    let progressData = [];
    let streakData = [];

    if (range === "week") {
      progressData = [
        { name: "Mon", completed: 4, target: 5 },
        { name: "Tue", completed: 3, target: 5 },
        { name: "Wed", completed: 5, target: 5 },
        { name: "Thu", completed: 2, target: 5 },
        { name: "Fri", completed: 4, target: 5 },
        { name: "Sat", completed: 6, target: 5 },
        { name: "Sun", completed: 3, target: 5 },
      ];

      streakData = [
        { date: "Mon", streak: 1 },
        { date: "Tue", streak: 2 },
        { date: "Wed", streak: 3 },
        { date: "Thu", streak: 0 },
        { date: "Fri", streak: 1 },
        { date: "Sat", streak: 2 },
        { date: "Sun", streak: 3 },
      ];
    } else if (range === "month") {
      progressData = [
        { name: "Week 1", completed: 18, target: 20 },
        { name: "Week 2", completed: 22, target: 20 },
        { name: "Week 3", completed: 17, target: 20 },
        { name: "Week 4", completed: 19, target: 20 },
      ];

      streakData = [
        { date: "Week 1", streak: 4 },
        { date: "Week 2", streak: 2 },
        { date: "Week 3", streak: 5 },
        { date: "Week 4", streak: 3 },
      ];
    } else {
      progressData = [
        { name: "Jan", completed: 75, target: 80 },
        { name: "Feb", completed: 68, target: 80 },
        { name: "Mar", completed: 91, target: 80 },
        { name: "Apr", completed: 85, target: 80 },
        { name: "May", completed: 78, target: 80 },
        { name: "Jun", completed: 82, target: 80 },
        { name: "Jul", completed: 89, target: 80 },
        { name: "Aug", completed: 72, target: 80 },
        { name: "Sep", completed: 81, target: 80 },
        { name: "Oct", completed: 83, target: 80 },
        { name: "Nov", completed: 87, target: 80 },
        { name: "Dec", completed: 94, target: 80 },
      ];

      streakData = Array.from({ length: 12 }, (_, i) => ({
        date: new Date(0, i).toLocaleString("default", { month: "short" }),
        streak: Math.floor(Math.random() * 10) + 1,
      }));
    }

    const skillData = []; // Empty array by default - we'll only use real data

    return { progressData, streakData, skillData };
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-zinc-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <DotsBackground />
      <Header />
      <div className="flex">
        <SideBar />
        <main
          className={`flex-1 p-4 sm:p-6 md:p-8 ${
            sidebarCollapsed ? "ml-20" : "ml-64"
          } transition-all duration-300`}
        >
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              } mb-4 sm:mb-0`}
            >
              Analytics & Progress Insights
            </h1>
            <div
              className={`inline-flex p-1 rounded-md ${
                isDark ? "bg-zinc-800" : "bg-gray-100"
              }`}
            >
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === "week"
                    ? isDark
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-500 text-white"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => handleTimeRangeChange("week")}
              >
                Week
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === "month"
                    ? isDark
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-500 text-white"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => handleTimeRangeChange("month")}
              >
                Month
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === "year"
                    ? isDark
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-500 text-white"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => handleTimeRangeChange("year")}
              >
                Year
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
              <div className="h-64 bg-gray-300 dark:bg-zinc-800 rounded-lg"></div>
              <div className="h-64 bg-gray-300 dark:bg-zinc-800 rounded-lg"></div>
              <div className="h-64 bg-gray-300 dark:bg-zinc-800 rounded-lg lg:col-span-2"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressChart
                data={progressData}
                title={`Progress (${
                  timeRange === "week"
                    ? "Daily"
                    : timeRange === "month"
                    ? "Weekly"
                    : "Monthly"
                })`}
              />
              <StreakChart
                data={streakData}
                title={`Activity Streaks (${
                  timeRange === "week"
                    ? "Daily"
                    : timeRange === "month"
                    ? "Weekly"
                    : "Monthly"
                })`}
              />
              <div className="lg:col-span-2">
                <SkillRadarChart data={skillData} title="Skill Distribution" />
              </div>
            </div>
          )}

          <div
            className={`mt-8 rounded-lg border ${
              isDark
                ? "border-zinc-700 bg-zinc-900/70"
                : "border-gray-200 bg-white"
            } p-4`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Achievement Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${
                      isDark ? "bg-indigo-900/50" : "bg-indigo-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 ${
                        isDark ? "text-indigo-400" : "text-indigo-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Completed Sessions
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {stats.completedSessions}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${
                      isDark ? "bg-green-900/50" : "bg-green-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Current Streak
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {stats.currentStreak}{" "}
                      {stats.currentStreak === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${
                      isDark ? "bg-purple-900/50" : "bg-purple-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 ${
                        isDark ? "text-purple-400" : "text-purple-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Total Time
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {stats.totalHours} hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
