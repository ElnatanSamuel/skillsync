import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";

const CalendarView = ({ sessions = [], onDateClick, onAddSession }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [sessionsByDate, setSessionsByDate] = useState({});
  const { isDark } = useTheme();

  // Process sessions to group by date
  useEffect(() => {
    const groupedSessions = {};

    sessions.forEach((session) => {
      const dateStr = format(parseISO(session.date), "yyyy-MM-dd");

      if (!groupedSessions[dateStr]) {
        groupedSessions[dateStr] = [];
      }

      groupedSessions[dateStr].push(session);
    });

    setSessionsByDate(groupedSessions);
  }, [sessions]);

  // Handle date click
  const handleDateClick = (day) => {
    setSelectedDate(day);

    const dateStr = format(day, "yyyy-MM-dd");
    const sessionsOnDate = sessionsByDate[dateStr] || [];

    // Call parent handler with selected date and sessions
    if (onDateClick) {
      onDateClick(day, sessionsOnDate);
    }
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Navigate to current month
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Generate days of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for the first day (0 = Sunday, 6 = Saturday)
  const startDay = monthStart.getDay();

  // Calculate previous month days to show
  const daysFromPrevMonth = Array.from({ length: startDay }).map((_, i) => {
    const day = new Date(monthStart);
    day.setDate(day.getDate() - (startDay - i));
    return day;
  });

  // Calculate next month days to show (to fill a 6-row grid)
  const totalDaysToShow = 42; // 6 rows of 7 days
  const daysFromNextMonth = [];
  const daysToAdd =
    totalDaysToShow - (daysFromPrevMonth.length + daysInMonth.length);

  if (daysToAdd > 0) {
    for (let i = 1; i <= daysToAdd; i++) {
      const day = new Date(monthEnd);
      day.setDate(day.getDate() + i);
      daysFromNextMonth.push(day);
    }
  }

  // Combine all days
  const allDays = [...daysFromPrevMonth, ...daysInMonth, ...daysFromNextMonth];

  // Week day headers
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      className={`${
        isDark
          ? "bg-zinc-900/70 border-indigo-500/20"
          : "bg-white border-indigo-200/60"
      } backdrop-blur-sm rounded-lg p-5 border`}
    >
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className={`p-1 rounded ${
              isDark
                ? "hover:bg-indigo-700/50 text-gray-300"
                : "hover:bg-indigo-100 text-gray-600"
            }`}
          >
            ◀
          </button>
          <button
            onClick={goToToday}
            className={`px-2 py-1 rounded text-xs ${
              isDark
                ? "bg-indigo-700/40 hover:bg-indigo-700/60 text-indigo-200"
                : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
            }`}
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className={`p-1 rounded ${
              isDark
                ? "hover:bg-indigo-700/50 text-gray-300"
                : "hover:bg-indigo-100 text-gray-600"
            }`}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className={`text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            } text-xs font-medium py-1`}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {allDays.map((day, index) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const hasSessions =
            sessionsByDate[dateStr] && sessionsByDate[dateStr].length > 0;
          const sessionsCount = hasSessions
            ? sessionsByDate[dateStr].length
            : 0;
          const hasCompletedSessions =
            hasSessions && sessionsByDate[dateStr].some((s) => s.completed);

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                p-1 border border-transparent rounded-md relative min-h-[60px] cursor-pointer
                ${
                  isCurrentMonth
                    ? isDark
                      ? "text-white"
                      : "text-gray-900"
                    : isDark
                    ? "text-gray-500"
                    : "text-gray-400"
                }
                ${
                  isSelected
                    ? isDark
                      ? "border-indigo-500 bg-indigo-900/40"
                      : "border-indigo-300 bg-indigo-100"
                    : ""
                }
                ${
                  isTodayDate
                    ? isDark
                      ? "bg-indigo-800/20"
                      : "bg-indigo-50"
                    : isDark
                    ? "hover:bg-zinc-800/50"
                    : "hover:bg-gray-50"
                }
              `}
            >
              <div className="text-xs flex justify-between items-start p-1">
                <span
                  className={
                    isTodayDate
                      ? isDark
                        ? "font-bold text-indigo-300"
                        : "font-bold text-indigo-600"
                      : ""
                  }
                >
                  {format(day, "d")}
                </span>
                {hasSessions && (
                  <span
                    className={`text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center 
                    ${
                      hasCompletedSessions
                        ? isDark
                          ? "bg-green-600/40 text-green-200"
                          : "bg-green-100 text-green-700"
                        : isDark
                        ? "bg-blue-600/40 text-blue-200"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {sessionsCount}
                  </span>
                )}
              </div>

              {/* Session indicators */}
              {hasSessions && (
                <div className="mt-1 px-1">
                  {sessionsByDate[dateStr].slice(0, 2).map((session, idx) => (
                    <div
                      key={idx}
                      className={`
                        truncate text-xs rounded py-0.5 px-1 mb-0.5
                        ${
                          session.completed
                            ? isDark
                              ? "bg-green-900/40 text-green-300"
                              : "bg-green-100 text-green-700"
                            : isDark
                            ? "bg-blue-900/40 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                        }
                      `}
                    >
                      {session.title}
                    </div>
                  ))}
                  {sessionsByDate[dateStr].length > 2 && (
                    <div
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      } truncate`}
                    >
                      +{sessionsByDate[dateStr].length - 2} more
                    </div>
                  )}
                </div>
              )}

              {/* Add button (only show for current month dates) */}
              {isCurrentMonth && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddSession) onAddSession(day);
                  }}
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-xs opacity-0 hover:opacity-100 group-hover:opacity-80 text-white"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
