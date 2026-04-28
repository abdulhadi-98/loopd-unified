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
      router.push('/scan');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-center mb-8">Staff Login</h1>
        {step === 'phone' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div className="flex border border-gray-600 rounded-xl overflow-hidden bg-gray-800">
              <span className="px-3 py-3 text-gray-400 font-mono">+92</span>
              <input
                type="tel"
                placeholder="3001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="flex-1 bg-transparent px-3 py-3 text-white focus:outline-none"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 py-3 rounded-xl font-semibold disabled:opacity-50">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white focus:outline-none"
            />
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
