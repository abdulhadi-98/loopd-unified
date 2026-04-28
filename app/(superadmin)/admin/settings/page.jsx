'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Shell from '../../../../components/superadmin/Shell';

export default function Settings() {
  const router = useRouter();
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedForm, setSeedForm] = useState({ name: '', email: '', password: '' });
  const [seedResult, setSeedResult] = useState('');

  async function handleSeed(e) {
    e.preventDefault();
    setSeedLoading(true);
    try {
      const { data } = await axios.post('/api/superadmin/seed', seedForm);
      setSeedResult(`✓ Superadmin created: ${data.email}`);
    } catch (err) {
      setSeedResult(err.response?.data?.error || 'Failed');
    } finally {
      setSeedLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('saToken');
    localStorage.removeItem('saAdmin');
    router.push('/login');
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-lg space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-1">Seed First Superadmin</h2>
          <p className="text-xs text-slate-500 mb-4">Only works if no superadmin exists yet. Disable after first use.</p>
          <form onSubmit={handleSeed} className="space-y-3">
            <input placeholder="Name" value={seedForm.name}
              onChange={(e) => setSeedForm({ ...seedForm, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
            <input type="email" placeholder="Email" value={seedForm.email}
              onChange={(e) => setSeedForm({ ...seedForm, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
            <input type="password" placeholder="Password" value={seedForm.password}
              onChange={(e) => setSeedForm({ ...seedForm, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none" />
            <button type="submit" disabled={seedLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition disabled:opacity-50">
              {seedLoading ? 'Creating...' : 'Create Superadmin'}
            </button>
            {seedResult && <p className="text-sm text-green-400">{seedResult}</p>}
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-3">Session</h2>
          <button onClick={logout}
            className="px-5 py-2.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded-xl text-sm font-semibold transition">
            Sign Out
          </button>
        </div>
      </div>
    </Shell>
  );
}
