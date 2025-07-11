import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  FaTimes,
  FaCheck,
  FaTrashAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";

const EditSessionModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  session,
  goals = [],
}) => {
  const { success, error: showError } = useToast();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: 30,
    goalId: "",
    notes: "",
    completed: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (session && isOpen) {
      // Convert ISO date to local date and time for form inputs
      const sessionDate = new Date(session.date);

      // Format the date as YYYY-MM-DD
      const year = sessionDate.getFullYear();
      const month = String(sessionDate.getMonth() + 1).padStart(2, "0");
      const day = String(sessionDate.getDate()).padStart(2, "0");
      const localDate = `${year}-${month}-${day}`;

      // Format time as HH:MM
      const hours = String(sessionDate.getHours()).padStart(2, "0");
      const minutes = String(sessionDate.getMinutes()).padStart(2, "0");
      const localTime = `${hours}:${minutes}`;

      setFormData({
        title: session.title || "",
        date: localDate,
        time: localTime,
        duration: session.duration || 30,
        goalId: session.goalId || "",
        notes: session.notes || "",
        completed: session.completed || false,
      });

      // Clear any previous errors
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [session, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validate title (required)
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    // Validate time
    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    // Validate duration
    if (
      !formData.duration ||
      isNaN(Number(formData.duration)) ||
      Number(formData.duration) < 1
    ) {
      newErrors.duration = "Duration must be at least 1 minute";
    }

    // Validate goalId
    if (!formData.goalId) {
      newErrors.goalId = "Please select a goal";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time for the API
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const sessionData = {
        ...session,
        title: formData.title.trim(),
        date: dateTime.toISOString(),
        duration: Number(formData.duration),
        goalId: Number(formData.goalId),
        notes: formData.notes.trim(),
        completed: formData.completed,
      };

      await onSave(sessionData);
      success("Session updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating session:", err);
      showError(err.response?.data?.message || "Failed to update session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onDelete(session.id);
      success("Session deleted successfully!");
      onClose();
    } catch (err) {
      console.error("Error deleting session:", err);
      showError(err.response?.data?.message || "Failed to delete session");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`${
          isDark
            ? "bg-zinc-900 border-indigo-500/20"
            : "bg-white border-indigo-200/60"
        } rounded-lg border shadow-2xl w-[340px] max-h-[520px] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center px-4 py-3 border-b ${
            isDark ? "border-zinc-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`font-semibold text-lg ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Session
          </h2>
          <button
            onClick={onClose}
            className={`${
              isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
            {/* Title */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Title<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-2 ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border ${
                  errors.title ? "border-red-500" : ""
                } rounded focus:outline-none focus:border-indigo-500`}
                required
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Date/Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Date<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full p-2 ${
                    isDark
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } border ${
                    errors.date ? "border-red-500" : ""
                  } rounded focus:outline-none focus:border-indigo-500 appearance-none`}
                  required
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.date}
                  </p>
                )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Time<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full p-2 ${
                    isDark
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } border ${
                    errors.time ? "border-red-500" : ""
                  } rounded focus:outline-none focus:border-indigo-500 appearance-none`}
                  required
                />
                {errors.time && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            {/* Duration and Goal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Duration (min)<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  className={`w-full p-2 ${
                    isDark
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } border ${
                    errors.duration ? "border-red-500" : ""
                  } rounded focus:outline-none focus:border-indigo-500`}
                  required
                />
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.duration}
                  </p>
                )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Goal<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="goalId"
                  value={formData.goalId}
                  onChange={handleChange}
                  className={`w-full p-2 ${
                    isDark
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } border ${
                    errors.goalId ? "border-red-500" : ""
                  } rounded focus:outline-none focus:border-indigo-500`}
                  required
                >
                  <option value="">Select Goal</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
                {errors.goalId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.goalId}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className={`w-full p-2 ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border rounded focus:outline-none focus:border-indigo-500`}
              ></textarea>
            </div>

            {/* Completed checkbox */}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="completed"
                name="completed"
                checked={formData.completed}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="completed"
                className={`ml-2 block text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Mark as completed
              </label>
            </div>
          </div>

          {/* Footer with buttons */}
          <div
            className={`px-4 py-3 border-t ${
              isDark ? "border-zinc-700" : "border-gray-200"
            } flex justify-between items-center`}
          >
            <div>
              <button
                type="button"
                onClick={handleDelete}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded ${
                  showDeleteConfirm
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : isDark
                    ? "bg-zinc-800 hover:bg-zinc-700 text-red-400"
                    : "bg-gray-100 hover:bg-gray-200 text-red-600"
                } transition-colors`}
                disabled={isSubmitting}
              >
                <FaTrashAlt
                  className={`${showDeleteConfirm ? "mr-1.5" : ""}`}
                />
                {showDeleteConfirm ? "Confirm" : ""}
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  isDark
                    ? "bg-zinc-800 hover:bg-zinc-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-block animate-pulse">Saving...</span>
                ) : (
                  <>
                    <FaCheck className="mr-1.5" /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;
