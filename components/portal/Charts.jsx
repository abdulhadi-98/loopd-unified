'use client';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const TIER_COLORS = { bronze: '#b45309', silver: '#9ca3af', gold: '#eab308' };

export default function Charts({ recentTransactions }) {
  const dailyMap = {};
  (recentTransactions || []).forEach((t) => {
    const day = new Date(t.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap).map(([day, scans]) => ({ day, scans }));

  const tierMap = {};
  (recentTransactions || []).forEach((t) => {
    const tier = t.card_id?.tier || 'bronze';
    tierMap[tier] = (tierMap[tier] || 0) + 1;
  });
  const tierData = Object.entries(tierMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Daily Scans (This Week)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyData}>
            <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#111827', border: 'none' }} />
            <Bar dataKey="scans" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Tier Distribution</h3>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              {tierData.map((entry) => (
                <Cell key={entry.name} fill={TIER_COLORS[entry.name] || '#6366f1'} />
              ))}
            </Pie>
            <Legend />
            <Tooltip contentStyle={{ background: '#111827', border: 'none' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
