import { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaHistory,
  FaEllipsisV,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

export default function ScheduledGoals({
  goals = [],
  onMarkCompleted,
  onEdit,
  onDelete,
}) {
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [markedCompleteIds, setMarkedCompleteIds] = useState(new Set());
  const [showMenuId, setShowMenuId] = useState(null);

  if (!goals.length) {
    return <p className="text-gray-400">No scheduled goals yet.</p>;
  }

  const toggleExpand = (goalId) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const toggleMenu = (goalId, e) => {
    e.stopPropagation();
    setShowMenuId(showMenuId === goalId ? null : goalId);
  };

  const handleEdit = (goal, e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(goal);
    }
    setShowMenuId(null);
  };

  const handleDelete = (goalId, e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(goalId);
    }
    setShowMenuId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "overdue":
        return "border-red-500/30 bg-red-900/10";
      case "due-today":
        return "border-yellow-500/30 bg-yellow-900/10";
      default:
        return "border-blue-500/30 bg-blue-900/10";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "overdue":
        return (
          <span className="bg-red-700/20 text-red-400 text-xs px-2 py-1 rounded whitespace-nowrap">
            Overdue
          </span>
        );
      case "due-today":
        return (
          <span className="bg-yellow-700/20 text-yellow-400 text-xs px-2 py-1 rounded whitespace-nowrap">
            Due Today
          </span>
        );
      default:
        return (
          <span className="bg-blue-700/20 text-blue-400 text-xs px-2 py-1 rounded whitespace-nowrap">
            Upcoming
          </span>
        );
    }
  };

  const handleMarkCompleted = (goalId) => {
    // Check if already marked complete in this session
    if (markedCompleteIds.has(goalId)) {
      return;
    }

    if (onMarkCompleted) {
      // Add to local completed set to prevent marking again
      setMarkedCompleteIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(goalId);
        return newSet;
      });

      onMarkCompleted(goalId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {goals.map((goal) => {
        // Check if this goal has been marked complete already
        const isMarkedComplete = markedCompleteIds.has(goal.id);

        return (
          <div
            key={goal.id}
            className={`p-4 border rounded-lg ${getStatusColor(goal.status)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold text-white truncate max-w-[65%]">
                {goal.title}
              </h3>
              <div className="flex items-center gap-2">
                {isMarkedComplete ? (
                  <span className="bg-green-700/20 text-green-400 text-xs px-2 py-1 rounded whitespace-nowrap">
                    Completed Today
                  </span>
                ) : (
                  getStatusBadge(goal.status)
                )}

                {(onEdit || onDelete) && (
                  <div className="relative">
                    <button
                      onClick={(e) => toggleMenu(goal.id, e)}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                      <FaEllipsisV size={14} />
                    </button>

                    {showMenuId === goal.id && (
                      <div className="absolute z-10 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg w-32 py-1">
                        {onEdit && (
                          <button
                            onClick={(e) => handleEdit(goal, e)}
                            className="flex items-center gap-2 w-full text-left px-4 py-1 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
                          >
                            <FaEdit size={12} />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => handleDelete(goal.id, e)}
                            className="flex items-center gap-2 w-full text-left px-4 py-1 text-sm text-red-400 hover:bg-zinc-700"
                          >
                            <FaTrashAlt size={12} />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="text-sm">
                <div className="flex items-center gap-1 text-gray-300">
                  <span className="text-xs whitespace-nowrap">Next due:</span>
                  <span className="font-medium">
                    {goal.nextDueDate
                      ? formatDate(goal.nextDueDate)
                      : "Not scheduled"}
                  </span>
                </div>
                {goal.lastCompleted && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <FaHistory size={10} />
                    <span>Last: {formatDate(goal.lastCompleted)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => toggleExpand(goal.id)}
                  className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded flex items-center gap-1"
                >
                  {expandedGoalId === goal.id ? (
                    <>
                      <FaChevronUp size={10} />
                      <span className="hidden sm:inline">Hide</span>
                    </>
                  ) : (
                    <>
                      <FaChevronDown size={10} />
                      <span className="hidden sm:inline">Details</span>
                    </>
                  )}
                </button>
                {!isMarkedComplete && (
                  <button
                    onClick={() => handleMarkCompleted(goal.id)}
                    className="text-xs px-2 py-1 bg-green-800 rounded hover:bg-green-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <FaCheckCircle size={10} />
                    <span className="hidden sm:inline">Complete</span>
                  </button>
                )}
              </div>
            </div>

            {expandedGoalId === goal.id && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-sm text-gray-300 mb-2">
                  Frequency: Every {goal.frequency} days
                </p>
                <h4 className="text-sm font-medium text-gray-300">
                  Recent Sessions:
                </h4>
                {goal.sessions && goal.sessions.length > 0 ? (
                  <ul className="mt-2 space-y-1 max-h-[120px] overflow-y-auto">
                    {goal.sessions.slice(0, 3).map((session) => (
                      <li
                        key={session.id}
                        className="text-xs text-gray-400 flex justify-between bg-zinc-800/50 p-2 rounded"
                      >
                        <span className="truncate mr-2">
                          {session.title || "Untitled"}
                        </span>
                        <span className="text-gray-500 whitespace-nowrap">
                          {formatDate(session.date)}
                        </span>
                      </li>
                    ))}
                    {goal.sessions.length > 3 && (
                      <li className="text-xs text-indigo-400 text-center">
                        +{goal.sessions.length - 3} more sessions
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">No sessions yet</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
