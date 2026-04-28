'use client';

export default function LiveFeed({ transactions }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 h-full">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Live Activity
      </h3>
      <ul className="space-y-3 overflow-y-auto max-h-96">
        {(transactions || []).map((t, i) => (
          <li key={t._id || i} className="flex justify-between items-center text-sm">
            <div>
              <p className="font-medium">{t.card_id?.customer_id?.name || 'Customer'}</p>
              <p className="text-xs text-gray-500 capitalize">{t.type}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${t.points_delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {t.points_delta > 0 ? '+' : ''}{t.points_delta}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </li>
        ))}
        {!transactions?.length && <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>}
      </ul>
    </div>
  );
}
