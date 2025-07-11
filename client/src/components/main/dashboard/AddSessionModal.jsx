import { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";

export default function AddSessionModal({
  isOpen,
  onClose,
  onSave,
  goals = [],
}) {
  const { success, error: showError } = useToast();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState(30);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [completed, setCompleted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Update selectedGoalId when goals change
  useEffect(() => {
    if (goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    } else {
      setSelectedGoalId("");
    }

    // Reset form and errors when modal is opened
    if (isOpen) {
      resetForm();
    }
  }, [goals, isOpen]);

  const resetForm = () => {
    setTitle("");
    setNote("");
    setDuration(30);
    setCompleted(true);
    setSelectedGoalId(goals[0]?.id || "");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedGoalId) {
      newErrors.goalId = "Please select a goal";
    }

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) < 1) {
      newErrors.duration = "Duration must be at least 1 minute";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = {
        goalId: selectedGoalId,
        title: title.trim(),
        note: note.trim(),
        duration: Number(duration),
        date: new Date().toISOString(),
        completed,
      };

      await onSave(session);
      success("Session added successfully!");

      // Reset form
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error adding session:", err);
      showError(err.response?.data?.message || "Failed to add session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Update the field value
    switch (field) {
      case "title":
        setTitle(value);
        break;
      case "note":
        setNote(value);
        break;
      case "duration":
        setDuration(value);
        break;
      case "goalId":
        setSelectedGoalId(value);
        break;
      case "completed":
        setCompleted(value);
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl border border-indigo-500/20 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-white">Add Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Goal<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => handleInputChange("goalId", e.target.value)}
              className={`w-full p-2 bg-zinc-800 border ${
                errors.goalId ? "border-red-500" : "border-zinc-700"
              } rounded-lg text-white focus:outline-none focus:border-indigo-500`}
              required
              disabled={isSubmitting}
            >
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))
              ) : (
                <option disabled>No goals available</option>
              )}
            </select>
            {errors.goalId && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaExclamationTriangle className="mr-1" size={10} />
                {errors.goalId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              className={`w-full p-2 bg-zinc-800 border ${
                errors.title ? "border-red-500" : "border-zinc-700"
              } rounded-lg text-white focus:outline-none focus:border-indigo-500`}
              value={title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isSubmitting}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaExclamationTriangle className="mr-1" size={10} />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
              rows="3"
              value={note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Duration (minutes)<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              className={`w-full p-2 bg-zinc-800 border ${
                errors.duration ? "border-red-500" : "border-zinc-700"
              } rounded-lg text-white focus:outline-none focus:border-indigo-500`}
              value={duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              min="1"
              disabled={isSubmitting}
              required
            />
            {errors.duration && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaExclamationTriangle className="mr-1" size={10} />
                {errors.duration}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => handleInputChange("completed", e.target.checked)}
              className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded focus:ring-indigo-500 text-indigo-600"
              disabled={isSubmitting}
            />
            <label htmlFor="completed" className="ml-2 text-sm text-gray-300">
              Mark as completed
            </label>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg"
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center"
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                <span className="inline-block animate-pulse">Adding...</span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
