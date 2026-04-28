'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function History() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const { data } = await axios.get('/api/dashboard/customers?segment=all&limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/scan')} className="text-gray-400 text-sm">← Back</button>
        <h1 className="font-bold text-lg">Today's Activity</h1>
        <button onClick={load} className="ml-auto text-indigo-400 text-sm">Refresh</button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No scans yet today</p>
      ) : (
        <ul className="space-y-3">
          {transactions.map((item) => (
            <li key={item._id} className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.customer_id?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-400">{item.customer_id?.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-400">{item.points_balance} pts</p>
                <p className="text-xs text-gray-400 capitalize">{item.tier}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
