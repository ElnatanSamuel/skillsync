import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

export default function GoalCard({
  goal,
  title,
  value,
  icon,
  color = "indigo",
  onEdit,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const { isDark } = useTheme();

  const getGradient = () => {
    if (isDark) {
      switch (color) {
        case "green":
          return "from-green-500/20 to-green-800/20 border-green-500/30";
        case "red":
          return "from-red-500/20 to-red-800/20 border-red-500/30";
        case "yellow":
          return "from-yellow-500/20 to-yellow-800/20 border-yellow-500/30";
        default:
          return "from-indigo-500/20 to-indigo-800/20 border-indigo-500/30";
      }
    } else {
      // Light mode gradients
      switch (color) {
        case "green":
          return "from-green-100 to-green-200 border-green-300";
        case "red":
          return "from-red-100 to-red-200 border-red-300";
        case "yellow":
          return "from-yellow-100 to-yellow-200 border-yellow-300";
        default:
          return "from-indigo-100 to-indigo-200 border-indigo-300";
      }
    }
  };

  const getIconColor = () => {
    switch (color) {
      case "green":
        return isDark ? "text-green-400" : "text-green-600";
      case "red":
        return isDark ? "text-red-400" : "text-red-600";
      case "yellow":
        return isDark ? "text-yellow-400" : "text-yellow-600";
      default:
        return isDark ? "text-indigo-400" : "text-indigo-600";
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    if (onEdit && goal) {
      onEdit(goal);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (onDelete && goal) {
      onDelete(goal.id);
    }
    setShowMenu(false);
  };

  return (
    <div
      className={`bg-gradient-to-br ${getGradient()} rounded-xl border p-6 shadow-lg backdrop-blur-sm relative`}
    >
      {goal && (onEdit || onDelete) && (
        <div className="absolute top-2 right-2">
          <button
            onClick={toggleMenu}
            className={`${
              isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-700"
            } transition-colors p-1.5`}
          >
            <FaEllipsisV size={14} />
          </button>

          {showMenu && (
            <div
              className={`absolute z-10 right-0 mt-1 ${
                isDark
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-200"
              } border rounded-lg shadow-lg w-32 py-1`}
            >
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className={`block w-full text-left px-4 py-1 text-sm ${
                    isDark
                      ? "text-gray-300 hover:bg-zinc-700 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className={`block w-full text-left px-4 py-1 text-sm ${
                    isDark
                      ? "text-red-400 hover:bg-zinc-700"
                      : "text-red-600 hover:bg-gray-100"
                  }`}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={`p-3 rounded-lg ${
              isDark ? "bg-zinc-900/50" : "bg-white/80"
            } ${getIconColor()}`}
          >
            {icon}
          </div>
        )}
        <div>
          <h3
            className={`${
              isDark ? "text-gray-400" : "text-gray-600"
            } text-sm font-medium`}
          >
            {title}
          </h3>
          <p
            className={`${
              isDark ? "text-white" : "text-gray-900"
            } text-2xl font-bold mt-1`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
