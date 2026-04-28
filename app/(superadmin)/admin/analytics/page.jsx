'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Shell from '../../../../components/superadmin/Shell';
import StatCard from '../../../../components/superadmin/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [customers, setCustomers] = useState(null);

  function h() { return { Authorization: `Bearer ${localStorage.getItem('saToken')}` }; }

  useEffect(() => {
    Promise.all([
      axios.get('/api/superadmin/analytics', { headers: h() }),
      axios.get('/api/superadmin/customers?limit=10', { headers: h() }),
    ]).then(([a, c]) => { setData(a.data); setCustomers(c.data); });
  }, []);

  if (!data) return <Shell><p className="text-slate-400">Loading...</p></Shell>;

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Aggregated across all tenants</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Restaurants" value={data.totals.restaurants} />
        <StatCard label="Total Customers" value={data.totals.customers} color="text-blue-400" />
        <StatCard label="Total Transactions" value={data.totals.transactions} color="text-green-400" />
        <StatCard label="MRR" value={`₨${data.mrr.toLocaleString()}`} color="text-yellow-400" sub="Monthly recurring" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Subscription Health</h3>
          <div className="space-y-3">
            {Object.entries(data.subscriptions).map(([k, v]) => {
              const total = Object.values(data.subscriptions).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((v / total) * 100);
              const colors = { active: 'bg-green-500', trial: 'bg-yellow-500', suspended: 'bg-red-500' };
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-slate-300">{k}</span>
                    <span className="text-slate-400">{v} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors[k] || 'bg-slate-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Recent Customers (Platform-wide)</h3>
          <ul className="space-y-2 text-sm">
            {customers?.customers?.map((c) => (
              <li key={c._id} className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.phone}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold mb-2">New Restaurants This Month</h3>
        <p className="text-4xl font-bold text-violet-400">{data.newRestaurantsThisMonth}</p>
      </div>
    </Shell>
  );
}
