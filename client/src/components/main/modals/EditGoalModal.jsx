import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  FaTimes,
  FaCheck,
  FaTrashAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";

const EditGoalModal = ({ isOpen, onClose, onSave, onDelete, goal }) => {
  const { success, error: showError } = useToast();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    frequency: 0,
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (goal && isOpen) {
      setFormData({
        title: goal.title || "",
        frequency: goal.frequency || 0,
        description: goal.description || "",
      });

      // Clear any previous errors when opening the modal
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [goal, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validate title (required, min length)
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    // Validate frequency (must be a number)
    if (isNaN(Number(formData.frequency))) {
      newErrors.frequency = "Frequency must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "frequency" ? Number(value) : value,
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
      const goalData = {
        ...goal,
        title: formData.title.trim(),
        frequency: Number(formData.frequency),
        description: formData.description.trim(),
      };

      await onSave(goalData);
      success("Goal updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating goal:", err);
      showError(err.response?.data?.message || "Failed to update goal");
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
      await onDelete(goal.id);
      success("Goal deleted successfully!");
      onClose();
    } catch (err) {
      console.error("Error deleting goal:", err);
      showError(err.response?.data?.message || "Failed to delete goal");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark
            ? "bg-zinc-900 border-indigo-500/20"
            : "bg-white border-indigo-200/50"
        } rounded-xl border shadow-xl max-w-md w-full`}
      >
        <div
          className={`flex justify-between items-center p-4 border-b ${
            isDark ? "border-zinc-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Goal
          </h2>
          <button
            onClick={onClose}
            className={
              isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-900"
            }
            disabled={isSubmitting}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
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
                  isDark ? "bg-zinc-800 text-white" : "bg-gray-50 text-gray-900"
                } border ${
                  errors.title
                    ? "border-red-500"
                    : isDark
                    ? "border-zinc-700"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-indigo-500`}
                required
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className={`w-full p-2 ${
                  isDark ? "bg-zinc-800 text-white" : "bg-gray-50 text-gray-900"
                } border ${
                  errors.frequency
                    ? "border-red-500"
                    : isDark
                    ? "border-zinc-700"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-indigo-500`}
              >
                <option value="0">Not scheduled</option>
                <option value="1">Daily</option>
                <option value="7">Weekly</option>
                <option value="14">Bi-weekly</option>
                <option value="30">Monthly</option>
              </select>
              {errors.frequency && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {errors.frequency}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full p-2 ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border rounded-lg focus:outline-none focus:border-indigo-500`}
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showDeleteConfirm
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : isDark
                  ? "bg-zinc-800 hover:bg-zinc-700 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              disabled={isSubmitting}
            >
              <FaTrashAlt size={14} />
              {showDeleteConfirm ? "Confirm Delete" : "Delete"}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 ${
                  isDark
                    ? "bg-zinc-800 hover:bg-zinc-700 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } rounded-lg`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck size={14} />
                    Save Changes
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

export default EditGoalModal;
