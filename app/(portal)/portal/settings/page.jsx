'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function Settings() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('staffToken')}` };
  }

  useEffect(() => {
    const staff = JSON.parse(localStorage.getItem('staff') || '{}');
    if (!staff.restaurant_id) { router.replace('/portal/login'); return; }
    axios.get(`/api/dashboard/restaurant-public/${staff.restaurant_id}`, { headers: authHeaders() })
      .then((r) => { setRestaurant(r.data); setForm(r.data); })
      .catch(() => router.replace('/portal/login'));
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(`/api/dashboard/restaurant/${restaurant._id}`, form, { headers: authHeaders() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!restaurant) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-white">← Overview</Link>
      </div>

      <form onSubmit={save} className="bg-gray-900 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Restaurant Name</label>
          <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
          <input value={form.logo_url || ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Brand Color</label>
            <input type="color" value={form.brand_color || '#000000'}
              onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
              className="w-full h-12 rounded-xl border border-gray-700 bg-gray-800 cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Accent Color</label>
            <input type="color" value={form.accent_color || '#ffffff'}
              onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
              className="w-full h-12 rounded-xl border border-gray-700 bg-gray-800 cursor-pointer" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Points per PKR 100</label>
            <input type="number" value={form.points_per_100 || 10}
              onChange={(e) => setForm({ ...form, points_per_100: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Reward Threshold (pts)</label>
            <input type="number" value={form.reward_threshold || 300}
              onChange={(e) => setForm({ ...form, reward_threshold: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Reward Description</label>
          <input value={form.reward_description || ''}
            onChange={(e) => setForm({ ...form, reward_description: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full bg-indigo-600 py-3 rounded-xl font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
