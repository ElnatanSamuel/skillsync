import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger', 'warning', 'info'
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "text-red-500",
      button: "bg-red-600 hover:bg-red-700",
      border: "border-red-500/30",
    },
    warning: {
      icon: "text-yellow-500",
      button: "bg-yellow-600 hover:bg-yellow-700",
      border: "border-yellow-500/30",
    },
    info: {
      icon: "text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
      border: "border-blue-500/30",
    },
  };

  const styles = typeStyles[type] || typeStyles.danger;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className={`bg-zinc-900 rounded-lg border ${styles.border} shadow-xl w-[320px] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700">
          <h3 className="font-semibold text-white flex items-center">
            <FaExclamationTriangle className={`mr-2 ${styles.icon}`} />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-300 mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-300 rounded text-sm"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-2 ${styles.button} text-white rounded text-sm flex items-center justify-center min-w-[80px]`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-block animate-pulse">
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
