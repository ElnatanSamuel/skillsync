export default function GoalCard({ title, value }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-xl shadow text-center">
      <h3 className="text-lg text-gray-400">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
