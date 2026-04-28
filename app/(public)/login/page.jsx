'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('r');

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);

  async function sendOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { phone: `+92${phone}` });
      sessionStorage.setItem('enroll_restaurantId', restaurantId);
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
      const { data } = await axios.post('/api/auth/verify-otp', { phone: `+92${phone}`, code });
      localStorage.setItem('token', data.token);
      router.push(`/my-card?r=${restaurantId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h2 className="text-2xl font-bold mb-6">{step === 'phone' ? 'Welcome back' : 'Enter OTP'}</h2>
      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="w-full max-w-xs space-y-4">
          <div className="flex border rounded-xl overflow-hidden">
            <span className="bg-gray-100 px-3 py-3 text-gray-500 font-mono">+92</span>
            <input
              type="tel"
              placeholder="3001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="flex-1 px-3 py-3 text-lg focus:outline-none"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="w-full max-w-xs space-y-4">
          <input
            type="text"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="w-full border rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button type="submit" disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      )}
    </div>
  );
}
