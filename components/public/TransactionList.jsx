export default function TransactionList({ transactions }) {
  if (!transactions?.length) {
    return <p className="text-sm opacity-50 text-center py-4">No transactions yet</p>;
  }
  return (
    <ul className="space-y-2">
      {transactions.map((t) => (
        <li key={t._id} className="flex justify-between items-center bg-white bg-opacity-10 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium capitalize">{t.type}</p>
            <p className="text-xs opacity-60">{new Date(t.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`font-bold text-lg ${t.points_delta > 0 ? 'text-green-300' : 'text-red-300'}`}>
            {t.points_delta > 0 ? '+' : ''}{t.points_delta}
          </span>
        </li>
      ))}
    </ul>
  );
}
