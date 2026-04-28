'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Verify() {
  const router = useRouter();
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) return;
    setLoading(true);
    try {
      const phone = sessionStorage.getItem('enroll_phone');
      const { data } = await axios.post('/api/auth/verify-otp', { phone, code });
      localStorage.setItem('token', data.token);
      localStorage.setItem('customerId', data.customerId || '');
      router.push('/enroll/wallet-choice');
    } catch (err) {
      alert(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    const phone = sessionStorage.getItem('enroll_phone');
    await axios.post('/api/auth/send-otp', { phone });
    setCountdown(60);
    setDigits(Array(6).fill(''));
  }

  const phone = typeof window !== 'undefined' ? sessionStorage.getItem('enroll_phone') : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h2 className="text-2xl font-bold mb-2">Enter your code</h2>
      <p className="text-gray-500 mb-6 text-sm">Sent to {phone}</p>
      <form onSubmit={handleVerify} className="w-full max-w-xs">
        <div className="flex gap-2 justify-center mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-14 border-2 rounded-xl text-center text-2xl font-bold focus:outline-none focus:border-black"
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || digits.join('').length < 6}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50 mb-3"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        <div className="text-center text-sm text-gray-500">
          {countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <button type="button" onClick={resend} className="text-black underline font-medium">
              Resend OTP
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
