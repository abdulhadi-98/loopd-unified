export default function PointsBar({ current, max }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-between text-xs opacity-60 mb-1">
        <span>{current} pts</span>
        <span>{max} pts for reward</span>
      </div>
      <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
        <div className="bg-white rounded-full h-3 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
