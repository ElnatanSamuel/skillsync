import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { format, isBefore, startOfDay } from "date-fns";
import { FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import EditSessionModal from "../modals/EditSessionModal";

const DateDetail = ({
  date,
  sessions = [],
  goals = [],
  onAddSession,
  onMarkCompleted,
  onUpdateSession,
  onDeleteSession,
}) => {
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    duration: 30,
    notes: "",
  });
  const [showMenuId, setShowMenuId] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isDark } = useTheme();

  if (!date) {
    return (
      <div
        className={`${
          isDark
            ? "bg-zinc-900/70 border-indigo-500/20"
            : "bg-white border-indigo-200/60"
        } backdrop-blur-sm rounded-lg p-5 border h-full flex items-center justify-center`}
      >
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
          Select a date to view sessions
        </p>
      </div>
    );
  }

  const handleNewSessionChange = (e) => {
    const { name, value } = e.target;
    setNewSession((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newSession.title.trim()) {
      return;
    }

    // Create session object with selected date
    const sessionData = {
      ...newSession,
      date: date.toISOString(),
      completed: false,
    };

    onAddSession(sessionData);

    // Reset form
    setNewSession({
      title: "",
      duration: 30,
      notes: "",
    });
    setIsAddingSession(false);
  };

  const toggleMenu = (sessionId, e) => {
    e.stopPropagation();
    setShowMenuId(showMenuId === sessionId ? null : sessionId);
  };

  const handleEdit = (session, e) => {
    e.stopPropagation();
    setEditingSession(session);
    setIsEditModalOpen(true);
    setShowMenuId(null);
  };

  const handleDelete = (sessionId, e) => {
    e.stopPropagation();
    if (onDeleteSession) {
      onDeleteSession(sessionId);
    }
    setShowMenuId(null);
  };

  const handleUpdateSession = async (updatedSession) => {
    if (onUpdateSession) {
      await onUpdateSession(updatedSession);
    }
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), "h:mm a");
  };

  const today = new Date();
  const isToday = today.toDateString() === date.toDateString();
  const isPastDate = isBefore(startOfDay(date), startOfDay(today));

  return (
    <div
      className={`${
        isDark
          ? "bg-zinc-900/70 border-indigo-500/20"
          : "bg-white border-indigo-200/60"
      } backdrop-blur-sm rounded-lg p-5 border h-full`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {format(date, "EEEE, MMMM d, yyyy")}
          {isToday && (
            <span
              className={`ml-2 text-sm ${
                isDark
                  ? "bg-indigo-600/50 text-indigo-200"
                  : "bg-indigo-100 text-indigo-700"
              } px-2 py-0.5 rounded`}
            >
              Today
            </span>
          )}
          {isPastDate && (
            <span
              className={`ml-2 text-sm ${
                isDark
                  ? "bg-gray-600/50 text-gray-200"
                  : "bg-gray-100 text-gray-700"
              } px-2 py-0.5 rounded`}
            >
              Past
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsAddingSession(true)}
          className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-white"
        >
          Add Session
        </button>
      </div>

      {isAddingSession ? (
        <div
          className={`mb-6 ${
            isDark ? "bg-zinc-800/50" : "bg-gray-50"
          } p-4 rounded-lg`}
        >
          <h4
            className={`text-sm font-medium ${
              isDark ? "text-indigo-300" : "text-indigo-600"
            } mb-3`}
          >
            New Session
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                className={`block ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } text-xs mb-1`}
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                value={newSession.title}
                onChange={handleNewSessionChange}
                className={`w-full ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                } border rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500`}
                placeholder="Session title"
                required
              />
            </div>

            <div className="mb-3">
              <label
                className={`block ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } text-xs mb-1`}
              >
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={newSession.duration}
                onChange={handleNewSessionChange}
                className={`w-full ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                } border rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500`}
                min="1"
              />
            </div>

            <div className="mb-4">
              <label
                className={`block ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } text-xs mb-1`}
              >
                Notes
              </label>
              <textarea
                name="notes"
                value={newSession.notes}
                onChange={handleNewSessionChange}
                className={`w-full ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                } border rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500`}
                rows="2"
                placeholder="Optional notes"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingSession(false)}
                className={`px-3 py-1.5 ${
                  isDark
                    ? "border-zinc-600 text-gray-300 hover:bg-zinc-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                } border rounded-md text-xs`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs text-white"
              >
                Save Session
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            No sessions for this day
          </p>
          <button
            onClick={() => setIsAddingSession(true)}
            className={
              isDark
                ? "text-indigo-400 hover:text-indigo-300"
                : "text-indigo-600 hover:text-indigo-500"
            }
          >
            + Add your first session
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg border ${
                session.completed
                  ? isDark
                    ? "bg-green-900/20 border-green-700/30"
                    : "bg-green-50 border-green-200"
                  : isDark
                  ? "bg-zinc-800/50 border-zinc-700/50"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4
                    className={`font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {session.title}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatTime(session.date)}
                    </span>
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {session.duration} min
                    </span>
                  </div>
                  {session.notes && (
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      } mt-2`}
                    >
                      {session.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {session.completed ? (
                    <span
                      className={`text-xs px-2 py-1 ${
                        isDark
                          ? "bg-green-900/30 text-green-300"
                          : "bg-green-100 text-green-700"
                      } rounded`}
                    >
                      Completed
                    </span>
                  ) : isPastDate ? (
                    <span
                      className={`text-xs px-2 py-1 ${
                        isDark
                          ? "bg-gray-800 text-gray-400"
                          : "bg-gray-100 text-gray-500"
                      } rounded`}
                    >
                      Past Due
                    </span>
                  ) : (
                    <button
                      onClick={() => onMarkCompleted(session.id)}
                      className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded transition-colors text-white"
                    >
                      Mark Complete
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={(e) => toggleMenu(session.id, e)}
                      className={`${
                        isDark
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-500 hover:text-gray-900"
                      } transition-colors p-1`}
                    >
                      <FaEllipsisV size={14} />
                    </button>

                    {showMenuId === session.id && (
                      <div
                        className={`absolute z-10 right-0 mt-1 ${
                          isDark
                            ? "bg-zinc-800 border-zinc-700"
                            : "bg-white border-gray-200"
                        } border rounded-lg shadow-lg w-32 py-1`}
                      >
                        <button
                          onClick={(e) => handleEdit(session, e)}
                          className={`flex items-center gap-2 w-full text-left px-4 py-1 text-sm ${
                            isDark
                              ? "text-blue-400 hover:bg-zinc-700"
                              : "text-blue-600 hover:bg-gray-100"
                          }`}
                        >
                          <FaEdit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(session.id, e)}
                          className={`flex items-center gap-2 w-full text-left px-4 py-1 text-sm ${
                            isDark
                              ? "text-red-400 hover:bg-zinc-700"
                              : "text-red-600 hover:bg-gray-100"
                          }`}
                        >
                          <FaTrashAlt size={12} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateSession}
        session={editingSession}
      />
    </div>
  );
};

export default DateDetail;
