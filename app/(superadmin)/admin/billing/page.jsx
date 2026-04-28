'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Shell from '../../../../components/superadmin/Shell';

export default function Billing() {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '', price_monthly: 0, max_customers: 500, max_staff: 5,
    features: { apple_wallet: false, google_wallet: false, campaigns: false, analytics: true, custom_branding: false },
  });

  function h() { return { Authorization: `Bearer ${localStorage.getItem('saToken')}` }; }

  async function load() {
    const { data } = await axios.get('/api/superadmin/plans', { headers: h() });
    setPlans(data.plans);
  }

  useEffect(() => { load(); }, []);

  async function savePlan(id) {
    setSaving(true);
    await axios.patch(`/api/superadmin/plans/${id}`, form, { headers: h() });
    setEditing(null);
    load();
    setSaving(false);
  }

  async function createPlan(e) {
    e.preventDefault();
    setSaving(true);
    await axios.post('/api/superadmin/plans', newPlan, { headers: h() });
    setShowNew(false);
    load();
    setSaving(false);
  }

  function featureToggle(planData, setPlanData, key) {
    setPlanData({ ...planData, features: { ...planData.features, [key]: !planData.features[key] } });
  }

  const FEATURES = ['apple_wallet', 'google_wallet', 'campaigns', 'analytics', 'custom_branding'];

  return (
    <Shell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Plans & Billing</h1>
          <p className="text-slate-400 text-sm mt-1">Manage subscription tiers</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
          + New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {editing === p._id ? (
              <div className="space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                <div className="flex gap-2 items-center">
                  <span className="text-slate-400 text-sm">₨</span>
                  <input type="number" value={form.price_monthly}
                    onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <input type="number" value={form.max_customers}
                  onChange={(e) => setForm({ ...form, max_customers: Number(e.target.value) })}
                  placeholder="Max customers"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                <div className="space-y-2">
                  {FEATURES.map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.features?.[f] || false}
                        onChange={() => setForm({ ...form, features: { ...form.features, [f]: !form.features?.[f] } })}
                        className="accent-violet-500" />
                      <span className="text-slate-300 capitalize">{f.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => savePlan(p._id)} disabled={saving}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 py-2 rounded-xl text-sm font-semibold transition">
                    Save
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-2xl font-black text-violet-400 mt-1">
                      ₨{p.price_monthly.toLocaleString()}
                      <span className="text-sm font-normal text-slate-400">/mo</span>
                    </p>
                  </div>
                  <button onClick={() => { setEditing(p._id); setForm({ ...p }); }}
                    className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition">
                    Edit
                  </button>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Up to {p.max_customers.toLocaleString()} customers · {p.max_staff} staff
                </p>
                <ul className="space-y-1.5">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <span className={p.features[f] ? 'text-green-400' : 'text-slate-600'}>
                        {p.features[f] ? '✓' : '✗'}
                      </span>
                      <span className={`capitalize ${p.features[f] ? 'text-slate-300' : 'text-slate-600'}`}>
                        {f.replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={createPlan}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">New Plan</h2>
            <input placeholder="Plan name" required value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Price (PKR/mo)" required value={newPlan.price_monthly}
                onChange={(e) => setNewPlan({ ...newPlan, price_monthly: Number(e.target.value) })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none" />
              <input type="number" placeholder="Max customers" value={newPlan.max_customers}
                onChange={(e) => setNewPlan({ ...newPlan, max_customers: Number(e.target.value) })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none" />
            </div>
            <div className="space-y-2">
              {FEATURES.map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={newPlan.features[f]}
                    onChange={() => featureToggle(newPlan, setNewPlan, f)} className="accent-violet-500" />
                  <span className="capitalize text-slate-300">{f.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition">
                Create Plan
              </button>
              <button type="button" onClick={() => setShowNew(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Shell>
  );
}
