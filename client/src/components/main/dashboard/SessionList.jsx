export default function SessionList() {
  // Static data for now
  const sessions = [
    { goal: "React Practice", time: "2:00 PM", duration: "1 hr" },
    { goal: "DSA Grind", time: "4:00 PM", duration: "45 mins" },
  ];

  return (
    <div className="space-y-4">
      {sessions.map((session, i) => (
        <div
          key={i}
          className="bg-zinc-800 p-4 rounded-lg flex justify-between items-center"
        >
          <div>
            <h4 className="font-semibold">{session.goal}</h4>
            <p className="text-sm text-gray-400">
              {session.time} · {session.duration}
            </p>
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
            Done
          </button>
        </div>
      ))}
    </div>
  );
}
