'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Shell from '../../../../../components/superadmin/Shell';

export default function NewRestaurant() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', brand_color: '#000000', accent_color: '#ffffff',
    points_per_100: 10, reward_threshold: 300,
    reward_description: 'Free item of your choice', planId: '',
  });

  function h() { return { Authorization: `Bearer ${localStorage.getItem('saToken')}` }; }

  useEffect(() => {
    axios.get('/api/superadmin/plans', { headers: h() }).then((r) => setPlans(r.data.plans));
  }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function autoSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post('/api/superadmin/restaurants', form, { headers: h() });
      router.push(`/restaurants/${data.restaurant._id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create restaurant');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell>
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-slate-400 text-sm mb-3 hover:text-white">← Back</button>
        <h1 className="text-2xl font-bold">Add Restaurant</h1>
      </div>

      <form onSubmit={submit} className="max-w-2xl space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-300">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Restaurant Name *</label>
              <input required value={form.name}
                onChange={(e) => { set('name', e.target.value); set('slug', autoSlug(e.target.value)); }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Slug (URL) *</label>
              <input required value={form.slug} onChange={(e) => set('slug', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Reward Description</label>
            <input value={form.reward_description} onChange={(e) => set('reward_description', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Points per PKR 100</label>
              <input type="number" value={form.points_per_100} onChange={(e) => set('points_per_100', Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Reward Threshold (pts)</label>
              <input type="number" value={form.reward_threshold} onChange={(e) => set('reward_threshold', Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Brand Color</label>
              <input type="color" value={form.brand_color} onChange={(e) => set('brand_color', e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Accent Color</label>
              <input type="color" value={form.accent_color} onChange={(e) => set('accent_color', e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-slate-300">Subscription Plan</h2>
          <div className="grid grid-cols-3 gap-3">
            {plans.map((p) => (
              <button key={p._id} type="button" onClick={() => set('planId', p._id)}
                className={`p-4 rounded-xl border text-left transition ${
                  form.planId === p._id
                    ? 'border-violet-500 bg-violet-900/30'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-slate-400">₨{p.price_monthly.toLocaleString()}/mo</p>
                <p className="text-xs text-slate-500 mt-1">{p.max_customers.toLocaleString()} customers</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">Starts on 14-day trial. No plan = Starter trial.</p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition disabled:opacity-50">
          {saving ? 'Creating...' : 'Create Restaurant'}
        </button>
      </form>
    </Shell>
  );
}
