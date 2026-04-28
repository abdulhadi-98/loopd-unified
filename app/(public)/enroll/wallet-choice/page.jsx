'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function WalletChoice() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);

  async function enroll(channel) {
    setLoading(channel);
    try {
      const token = localStorage.getItem('token');
      const name = sessionStorage.getItem('enroll_name');
      const phone = sessionStorage.getItem('enroll_phone');
      const restaurantId = sessionStorage.getItem('enroll_restaurantId');

      const { data } = await axios.post(
        '/api/enroll',
        { name, phone, restaurantId, notificationChannel: channel },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (channel === 'apple' && data.passData) {
        const byteArr = Uint8Array.from(atob(data.passData), (c) => c.charCodeAt(0));
        const blob = new Blob([byteArr], { type: 'application/vnd.apple.pkpass' });
        window.location.href = URL.createObjectURL(blob);
        return;
      }

      if (channel === 'google' && data.googleWalletUrl) {
        window.location.href = data.googleWalletUrl;
        return;
      }

      if (channel === 'web') {
        if ('Notification' in window && Notification.permission !== 'granted') {
          await Notification.requestPermission();
        }
        localStorage.setItem('cardId', data.card._id);
        router.push(`/my-card?r=${sessionStorage.getItem('enroll_restaurantId')}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h2 className="text-2xl font-bold mb-2">How would you like your card?</h2>
      <p className="text-gray-500 mb-8 text-sm">Choose how to save your loyalty card</p>
      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={() => enroll('apple')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-black rounded-xl py-4 font-semibold text-lg disabled:opacity-50"
        >
          <span>🍎</span>
          {loading === 'apple' ? 'Generating...' : 'Add to Apple Wallet'}
        </button>
        <button
          onClick={() => enroll('google')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 rounded-xl py-4 font-semibold text-lg disabled:opacity-50"
        >
          <span>🔵</span>
          {loading === 'google' ? 'Redirecting...' : 'Add to Google Wallet'}
        </button>
        <button
          onClick={() => enroll('web')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-3 bg-gray-100 rounded-xl py-4 font-semibold text-lg disabled:opacity-50"
        >
          <span>🌐</span>
          {loading === 'web' ? 'Setting up...' : 'Use Web Card'}
        </button>
      </div>
    </div>
  );
}
