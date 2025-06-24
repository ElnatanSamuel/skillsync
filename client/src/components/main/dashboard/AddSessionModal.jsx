export default function AddSessionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Session</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Goal"
            className="w-full bg-zinc-800 text-white p-2 rounded"
          />
          <input
            type="time"
            className="w-full bg-zinc-800 text-white p-2 rounded"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            className="w-full bg-zinc-800 text-white p-2 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 border border-gray-500 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
