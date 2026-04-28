export default function StatCard({ label, value, sub, color = 'text-violet-400' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value?.toLocaleString?.() ?? value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
