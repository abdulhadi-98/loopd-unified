'use client';
import { useState } from 'react';

export default function CustomerTable({ customers }) {
  const [expanded, setExpanded] = useState(null);

  if (!customers.length) {
    return <p className="text-gray-400 text-center py-8">No customers found</p>;
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-left border-b border-gray-800">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Points</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Visits</th>
            <th className="px-4 py-3">Last Visit</th>
            <th className="px-4 py-3">Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((item) => {
            const c = item.customer_id || {};
            const lastVisit = item.last_visit
              ? Math.round((Date.now() - new Date(item.last_visit)) / 86400000)
              : null;
            const tierColor = { bronze: 'text-amber-600', silver: 'text-gray-400', gold: 'text-yellow-400' }[item.tier];

            return (
              <>
                <tr
                  key={item._id}
                  onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-indigo-400">{item.points_balance}</td>
                  <td className={`px-4 py-3 capitalize font-semibold ${tierColor}`}>{item.tier}</td>
                  <td className="px-4 py-3">{item.total_visits}</td>
                  <td className="px-4 py-3 text-gray-400">{lastVisit != null ? `${lastVisit}d ago` : 'Never'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(item.enrolled_at).toLocaleDateString()}</td>
                </tr>
                {expanded === item._id && (
                  <tr key={`${item._id}-exp`} className="bg-gray-800">
                    <td colSpan={6} className="px-4 py-3 text-sm text-gray-400">
                      Total Spend: ₨{(item.total_spend || 0).toLocaleString()} &nbsp;|&nbsp;
                      QR: <span className="font-mono text-xs">{item.qr_value?.substring(0, 16)}...</span>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
