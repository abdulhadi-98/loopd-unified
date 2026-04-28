'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { io } from 'socket.io-client';
import StatsCards from '../../../components/portal/StatsCards';
import LiveFeed from '../../../components/portal/LiveFeed';
import Charts from '../../../components/portal/Charts';
import Link from 'next/link';

export default function Overview() {
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [feed, setFeed] = useState([]);

  function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('staffToken')}` };
  }

  useEffect(() => {
    if (!localStorage.getItem('staffToken')) { router.replace('/portal/login'); return; }

    axios.get('/api/dashboard/overview', { headers: authHeaders() })
      .then((r) => setOverview(r.data))
      .catch(() => router.replace('/portal/login'));

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    socket.on('transaction:new', (tx) => {
      setFeed((prev) => [tx, ...prev].slice(0, 20));
    });
    return () => socket.disconnect();
  }, []);

  if (!overview) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <nav className="flex gap-4 text-sm text-gray-400">
          <Link href="/customers" className="hover:text-white">Customers</Link>
          <Link href="/campaigns" className="hover:text-white">Campaigns</Link>
          <Link href="/settings" className="hover:text-white">Settings</Link>
        </nav>
      </div>

      <StatsCards today={overview.today} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Charts recentTransactions={overview.recentTransactions} />
        </div>
        <div>
          <LiveFeed transactions={feed.length ? feed : overview.recentTransactions} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-5">
          <h3 className="font-semibold mb-3 text-red-400">At Risk Customers</h3>
          <p className="text-4xl font-bold">{overview.atRisk}</p>
          <p className="text-sm text-gray-400 mt-1">No visit in 14+ days</p>
          <Link href="/customers?segment=at_risk"
            className="mt-3 inline-block text-sm text-indigo-400 hover:underline">
            View List →
          </Link>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Top Customers</h3>
          <ul className="space-y-2">
            {overview.thisWeek.topCustomers?.slice(0, 5).map((item) => (
              <li key={item._id} className="flex justify-between text-sm">
                <span>{item.customer_id?.name}</span>
                <span className="text-indigo-400 font-semibold">{item.points_balance} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
