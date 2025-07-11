import { useState } from "react";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaClock,
  FaEllipsisV,
} from "react-icons/fa";
import EditSessionModal from "../modals/EditSessionModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useToast } from "../../../context/ToastContext";

export default function SessionList({
  sessions = [],
  onMarkCompleted,
  onUpdate,
  onDelete,
  goals = [],
}) {
  const { success, error: showError } = useToast();
  const [editingSession, setEditingSession] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    data: null,
  });

  if (!sessions.length) {
    return <p className="text-gray-400">No sessions added yet.</p>;
  }

  const handleMarkCompleted = async (session) => {
    if (onMarkCompleted) {
      try {
        setIsLoading(true);
        await onMarkCompleted(session.id);
        success("Session marked as completed!");
      } catch (err) {
        showError("Failed to mark session as completed");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
    setShowMenuId(null);
  };

  const handleSaveEdit = async (updatedSession) => {
    if (onUpdate) {
      try {
        await onUpdate(updatedSession);
        // Toast is shown in the modal component
      } catch (err) {
        showError("Failed to update session");
        console.error(err);
      }
    }
  };

  const promptDeleteSession = (session) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Session",
      message: `Are you sure you want to delete "${
        session.title || "this session"
      }"? This action cannot be undone.`,
      action: handleDeleteSession,
      data: session.id,
    });
    setShowMenuId(null);
  };

  const handleDeleteSession = async (sessionId) => {
    if (onDelete) {
      try {
        setIsLoading(true);
        await onDelete(sessionId);
        success("Session deleted successfully!");
      } catch (err) {
        showError("Failed to delete session");
        console.error(err);
      } finally {
        setIsLoading(false);
        closeConfirmationModal();
      }
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
  };

  const toggleMenu = (sessionId) => {
    setShowMenuId(showMenuId === sessionId ? null : sessionId);
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if the date is today or yesterday
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        `, ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }
  };

  return (
    <>
      <div className="max-h-[350px] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3">
          {sessions.slice(0, 6).map((session) => (
            <div
              key={session.id}
              className={`p-3 border rounded-lg ${
                session.completed
                  ? "border-green-500/30 bg-green-900/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="mr-2 flex-1">
                  <h3 className="text-base font-medium text-white truncate">
                    {session.title || session.goal?.title || "Untitled Session"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-xs text-gray-400">
                      <FaClock className="mr-1" size={10} />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    {session.duration && (
                      <div className="flex items-center text-xs text-gray-500">
                        <FaHourglassHalf className="mr-1" size={10} />
                        <span>{session.duration} min</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full flex items-center whitespace-nowrap ${
                        session.completed
                          ? "bg-green-700/20 text-green-400"
                          : "bg-gray-700/20 text-gray-400"
                      }`}
                    >
                      {session.completed ? (
                        <>
                          <FaCheckCircle className="mr-1" size={10} />
                          <span className="hidden sm:inline">Completed</span>
                        </>
                      ) : (
                        <span>Pending</span>
                      )}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(session.id)}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <FaEllipsisV size={14} />
                      </button>

                      {showMenuId === session.id && (
                        <div className="absolute z-10 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg w-32 py-1">
                          <button
                            onClick={() => handleEdit(session)}
                            className="block w-full text-left px-4 py-1 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => promptDeleteSession(session)}
                            className="block w-full text-left px-4 py-1 text-sm text-red-400 hover:bg-zinc-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!session.completed && (
                    <button
                      onClick={() => handleMarkCompleted(session)}
                      className="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 rounded transition-colors whitespace-nowrap"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="inline-block animate-pulse">...</span>
                      ) : (
                        "Complete"
                      )}
                    </button>
                  )}
                </div>
              </div>
              {session.notes && (
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                  {session.notes}
                </p>
              )}
            </div>
          ))}
          {sessions.length > 6 && (
            <div className="text-center py-2 text-indigo-400 text-sm">
              +{sessions.length - 6} more sessions
            </div>
          )}
        </div>
      </div>

      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        onDelete={promptDeleteSession}
        session={editingSession}
        goals={goals}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={() =>
          confirmationModal.action &&
          confirmationModal.action(confirmationModal.data)
        }
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Delete"
        isLoading={isLoading}
        type="danger"
      />
    </>
  );
}
