'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/superadmin/login', { email, password });
      localStorage.setItem('saToken', data.token);
      localStorage.setItem('saAdmin', JSON.stringify(data.admin));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl font-black tracking-tight">
            Loyalr <span className="text-violet-500">↑</span>
          </span>
          <p className="text-slate-400 mt-1 text-sm">Superadmin Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 rounded-2xl p-6 space-y-4 border border-slate-800">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-4">
          First time? POST to /api/superadmin/seed to create your account.
        </p>
      </div>
    </div>
  );
}
