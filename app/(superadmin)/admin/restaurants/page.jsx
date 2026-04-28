'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Shell from '../../../../components/superadmin/Shell';

const STATUS_BADGE = {
  active:    'bg-green-900/50 text-green-400 border-green-700',
  trial:     'bg-yellow-900/50 text-yellow-400 border-yellow-700',
  suspended: 'bg-red-900/50 text-red-400 border-red-700',
  cancelled: 'bg-slate-800 text-slate-400 border-slate-700',
};

export default function Restaurants() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  function h() { return { Authorization: `Bearer ${localStorage.getItem('saToken')}` }; }

  async function load() {
    setLoading(true);
    try {
      const { data: res } = await axios.get(
        `/api/superadmin/restaurants?page=${page}&limit=20&search=${search}`,
        { headers: h() }
      );
      setData(res);
    } catch { router.replace('/admin/login'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, search]);

  async function suspend(id, currentStatus) {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    await axios.patch(`/api/superadmin/restaurants/${id}/subscription`, { status: newStatus }, { headers: h() });
    load();
  }

  async function deleteRestaurant(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await axios.delete(`/api/superadmin/restaurants/${id}`, { headers: h() });
    load();
  }

  return (
    <Shell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-slate-400 text-sm mt-1">{data?.total || 0} tenants</p>
        </div>
        <Link href="/admin/restaurants/new"
          className="bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
          + Add Restaurant
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-800">
              <th className="px-5 py-3">Restaurant</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Customers</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500">Loading...</td></tr>
            ) : (
              data?.restaurants?.map((r) => {
                const subStatus = r.subscription?.status || 'none';
                return (
                  <tr key={r._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {r.logo_url ? (
                          <img src={r.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ background: r.brand_color || '#1e293b' }}>
                            {r.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{r.subscription?.plan_id?.name || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs border capitalize ${STATUS_BADGE[subStatus] || STATUS_BADGE.cancelled}`}>
                        {subStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{r.customerCount}</td>
                    <td className="px-5 py-4 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link href={`/restaurants/${r._id}`}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition">
                          View
                        </Link>
                        <button
                          onClick={() => suspend(r._id, subStatus)}
                          className={`px-3 py-1 rounded-lg text-xs transition ${
                            subStatus === 'suspended'
                              ? 'bg-green-900/50 hover:bg-green-800 text-green-400'
                              : 'bg-orange-900/50 hover:bg-orange-800 text-orange-400'
                          }`}>
                          {subStatus === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => deleteRestaurant(r._id, r.name)}
                          className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-400 rounded-lg text-xs transition">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
        <span>Page {page} of {data?.pages || 1}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 bg-slate-800 rounded-lg disabled:opacity-40">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.pages || 1)}
            className="px-3 py-1 bg-slate-800 rounded-lg disabled:opacity-40">Next</button>
        </div>
      </div>
    </Shell>
  );
}
