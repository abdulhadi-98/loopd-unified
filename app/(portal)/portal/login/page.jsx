'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);

  async function sendOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { phone: `+92${phone}` });
      setStep('otp');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/staff-login', { phone: `+92${phone}`, code });
      localStorage.setItem('staffToken', data.token);
      localStorage.setItem('staff', JSON.stringify(data.staff));
      router.push('/portal');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed. Manager or owner access required.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-2">Loyalr</h1>
      <p className="text-gray-400 mb-8">Manager Dashboard</p>
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-6">
        {step === 'phone' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div className="flex border border-gray-700 rounded-xl overflow-hidden bg-gray-800">
              <span className="px-3 py-3 text-gray-400 font-mono">+92</span>
              <input type="tel" placeholder="3001234567" value={phone}
                onChange={(e) => setPhone(e.target.value)} required
                className="flex-1 bg-transparent px-3 py-3 text-white focus:outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 py-3 rounded-xl font-semibold disabled:opacity-50">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <input type="text" placeholder="6-digit code" value={code}
              onChange={(e) => setCode(e.target.value)} maxLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white focus:outline-none" />
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 py-3 rounded-xl font-semibold disabled:opacity-50">
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
