'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Shell from '../../../../components/superadmin/Shell';
import StatCard from '../../../../components/superadmin/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const SUB_COLORS = { active: '#22c55e', trial: '#f59e0b', suspended: '#ef4444', cancelled: '#6b7280' };

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/superadmin/analytics', {
      headers: { Authorization: `Bearer ${localStorage.getItem('saToken')}` },
    }).then((r) => setData(r.data)).catch(console.error);
  }, []);

  if (!data) {
    return <Shell><p className="text-slate-400">Loading platform analytics...</p></Shell>;
  }

  const subPieData = [
    { name: 'Active', value: data.subscriptions.active },
    { name: 'Trial', value: data.subscriptions.trial },
    { name: 'Suspended', value: data.subscriptions.suspended },
  ].filter((d) => d.value > 0);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time across all tenants</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Restaurants" value={data.totals.restaurants} color="text-violet-400" />
        <StatCard label="Total Customers" value={data.totals.customers} color="text-blue-400" />
        <StatCard label="Total Transactions" value={data.totals.transactions} color="text-green-400" />
        <StatCard
          label="Monthly Recurring Revenue"
          value={`₨${data.mrr.toLocaleString()}`}
          sub={`${data.newRestaurantsThisMonth} new restaurants this month`}
          color="text-yellow-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Subscription Breakdown</h3>
          <div className="flex gap-6 mb-4">
            {Object.entries(data.subscriptions).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-400 capitalize">{k}</p>
                <p className="text-2xl font-bold" style={{ color: SUB_COLORS[k] || '#fff' }}>{v}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={subPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {subPieData.map((entry) => (
                  <Cell key={entry.name} fill={SUB_COLORS[entry.name.toLowerCase()] || '#6366f1'} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Recent Restaurants</h3>
          <ul className="space-y-3">
            {data.recentRestaurants.map((r) => (
              <li key={r._id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.slug}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  );
}
