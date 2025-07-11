import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function GoalProgress({ goal }) {
  const { title, progress, target, percentage } = goal;

  // Determine color based on progress percentage
  const getProgressColor = () => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressBackground = () => {
    if (percentage >= 100) return "bg-green-500/10";
    if (percentage >= 60) return "bg-blue-500/10";
    if (percentage >= 30) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const getBorderColor = () => {
    if (percentage >= 100) return "border-green-500/30";
    if (percentage >= 60) return "border-blue-500/30";
    if (percentage >= 30) return "border-yellow-500/30";
    return "border-red-500/30";
  };

  return (
    <div
      className={`p-4 rounded-lg border ${getBorderColor()} ${getProgressBackground()}`}
    >
      <h3 className="text-base font-semibold mb-3 truncate">{title}</h3>

      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-300">Weekly progress</span>
        <span className="text-sm font-medium text-white">
          {progress}/{target} sessions
        </span>
      </div>

      <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${getProgressColor()}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        ></div>
      </div>

      <div className="mt-3 text-xs flex items-center">
        {percentage >= 100 ? (
          <div className="flex items-center text-green-400">
            <FaCheckCircle className="mr-1" />
            <span>Weekly target achieved!</span>
          </div>
        ) : (
          <div className="flex items-center text-gray-400">
            <FaExclamationCircle className="mr-1 text-yellow-500" />
            <span>
              {target - progress} more{" "}
              {target - progress === 1 ? "session" : "sessions"} needed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
