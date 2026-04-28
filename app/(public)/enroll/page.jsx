'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('r');
  const router = useRouter();

  const [restaurant, setRestaurant] = useState(null);
  const [step, setStep] = useState('landing');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      axios.get(`/api/dashboard/restaurant-public/${restaurantId}`).then((r) => setRestaurant(r.data)).catch(() => {});
    }
  }, [restaurantId]);

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { phone: `+92${phone}` });
      sessionStorage.setItem('enroll_name', name);
      sessionStorage.setItem('enroll_phone', `+92${phone}`);
      sessionStorage.setItem('enroll_restaurantId', restaurantId);
      router.push('/enroll/verify');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        {restaurant?.logo_url && (
          <img src={restaurant.logo_url} alt="logo" className="w-24 h-24 rounded-2xl mb-4 object-cover" />
        )}
        <h1 className="text-3xl font-bold mb-1">{restaurant?.name || 'Loyalr'}</h1>
        <p className="text-gray-500 mb-2">Earn rewards every visit</p>
        {restaurant && (
          <p className="text-sm text-gray-400 mb-8">
            Earn {restaurant.points_per_100} points per PKR 100 spent
          </p>
        )}
        <button
          onClick={() => setStep('phone')}
          className="w-full max-w-xs bg-black text-white py-3 rounded-xl font-semibold text-lg mb-3"
        >
          Get My Loyalty Card
        </button>
        <button
          onClick={() => router.push(`/login?r=${restaurantId}`)}
          className="text-sm text-gray-500 underline"
        >
          I already have a card
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h2 className="text-2xl font-bold mb-6">Create your card</h2>
      <form onSubmit={handleSendOtp} className="w-full max-w-xs space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}
