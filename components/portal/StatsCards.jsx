export default function StatsCards({ today }) {
  const cards = [
    { label: 'Scanned Today', value: today?.scans ?? 0, color: 'text-indigo-400' },
    { label: 'New Enrollments', value: today?.newEnrollments ?? 0, color: 'text-green-400' },
    { label: 'Points Issued', value: today?.pointsIssued ?? 0, color: 'text-yellow-400' },
    { label: 'Rewards Redeemed', value: today?.redemptions ?? 0, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-gray-900 rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-1">{c.label}</p>
          <p className={`text-3xl font-bold ${c.color}`}>{c.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
