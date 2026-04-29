'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import QRDisplay from '../../../components/public/QRDisplay';
import PointsBar from '../../../components/public/PointsBar';
import TierBadge from '../../../components/public/TierBadge';
import TransactionList from '../../../components/public/TransactionList';

function MyCardContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('r');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    const token = localStorage.getItem('token');
    axios
      .get(`/api/enroll/my-card?restaurantId=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white opacity-60">Loading your card...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white opacity-60">Card not found.</p>
      </div>
    );
  }

  const { card, transactions } = data;
  const restaurant = card.restaurant_id;
  const customer = card.customer_id;

  return (
    <div
      className="min-h-screen flex flex-col items-center py-8 px-4"
      style={{ backgroundColor: restaurant?.brand_color || '#111', color: restaurant?.accent_color || '#fff' }}
    >
      {restaurant?.logo_url && (
        <img src={restaurant.logo_url} alt="logo" className="w-16 h-16 rounded-xl mb-3 object-cover" />
      )}
      <h1 className="text-xl font-bold">{restaurant?.name}</h1>
      <p className="text-sm opacity-70 mb-4">{customer?.name}</p>
      <TierBadge tier={card.tier} />
      <div className="text-5xl font-extrabold my-4">{card.points_balance}</div>
      <p className="text-sm opacity-70 mb-4">points</p>
      <PointsBar current={card.points_balance} max={restaurant?.reward_threshold || 300} />
      <div className="my-6">
        <QRDisplay value={card.qr_value} />
        <p className="text-xs text-center opacity-60 mt-2">Show this QR to staff to earn points</p>
      </div>
      <div className="w-full max-w-sm">
        <h3 className="font-semibold mb-2 opacity-80">Recent Activity</h3>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}

export default function MyCardPage() {
  return <Suspense><MyCardContent /></Suspense>;
}
