'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import confetti from 'canvas-confetti';

export default function CustomerCard() {
  const router = useRouter();
  const [scanned, setScanned] = useState(null);
  const [billAmount, setBillAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('scanned_data');
    if (!raw) { router.replace('/scan'); return; }
    setScanned(JSON.parse(raw));
  }, []);

  function calcPreview() {
    if (!scanned || !billAmount) return '--';
    const r = scanned.card.restaurant_id;
    return Math.floor((Number(billAmount) / 100) * (r?.points_per_100 || 10));
  }

  async function addPoints() {
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const { data } = await axios.post(
        '/api/scan/points/add',
        { cardId: scanned.card._id, billAmount: Number(billAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.rewardUnlocked) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setToast(`🎉 Reward Unlocked! Balance: ${data.newBalance}`);
      } else {
        setToast(`✅ +${data.pointsAdded} pts — Balance: ${data.newBalance}`);
      }
      scanned.card.points_balance = data.newBalance;
      scanned.card.tier = data.tier;
      setScanned({ ...scanned });
      setBillAmount('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add points');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function redeem() {
    if (!confirm('Confirm reward redemption?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('staffToken');
      const { data } = await axios.post(
        '/api/scan/points/redeem',
        { cardId: scanned.card._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast(`🎁 Redeemed! New balance: ${data.newBalance}`);
      scanned.card.points_balance = data.newBalance;
      setScanned({ ...scanned });
    } catch (err) {
      alert(err.response?.data?.error || 'Redemption failed');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  if (!scanned) return null;

  const { customer, card } = scanned;
  const threshold = card.restaurant_id?.reward_threshold || 300;
  const pct = Math.min((card.points_balance / threshold) * 100, 100);
  const tierEmoji = { bronze: '🥉', silver: '🥈', gold: '🥇' }[card.tier] || '🥉';
  const lastVisit = card.last_visit
    ? Math.round((Date.now() - new Date(card.last_visit)) / 86400000)
    : null;

  return (
    <div className="min-h-screen flex flex-col px-4 pt-4 pb-6">
      <button onClick={() => router.push('/scan')} className="text-gray-400 mb-4 text-sm">← Back</button>

      {toast && (
        <div className="fixed top-4 inset-x-4 bg-green-600 text-white text-center py-3 rounded-xl font-semibold z-50 shadow-lg">
          {toast}
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
            {customer.name[0]}
          </div>
          <div>
            <p className="font-bold text-lg">{customer.name.toUpperCase()}</p>
            <p className="text-sm text-gray-400">{tierEmoji} {card.tier.charAt(0).toUpperCase() + card.tier.slice(1)} Member</p>
          </div>
        </div>

        <div className="bg-gray-700 rounded-full h-3 mb-1">
          <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mb-4">{card.points_balance} / {threshold} pts</p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-700 rounded-xl p-2">
            <p className="text-xs text-gray-400">Visits</p>
            <p className="font-bold">{card.total_visits}</p>
          </div>
          <div className="bg-gray-700 rounded-xl p-2">
            <p className="text-xs text-gray-400">Last Visit</p>
            <p className="font-bold text-sm">{lastVisit != null ? `${lastVisit}d ago` : 'First!'}</p>
          </div>
          <div className="bg-gray-700 rounded-xl p-2">
            <p className="text-xs text-gray-400">Spend</p>
            <p className="font-bold text-sm">₨{(card.total_spend || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-5 mb-4">
        <label className="block text-sm text-gray-400 mb-1">Bill Amount (PKR)</label>
        <input
          type="number"
          placeholder="e.g. 1500"
          value={billAmount}
          onChange={(e) => setBillAmount(e.target.value)}
          className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none mb-1"
        />
        <p className="text-sm text-gray-400 mb-4">
          Points to add: <span className="text-indigo-400 font-bold">{calcPreview()}</span>
        </p>
        <button
          onClick={addPoints}
          disabled={!billAmount || loading}
          className="w-full bg-green-600 py-4 rounded-xl font-bold text-lg disabled:opacity-50 mb-3"
        >
          ✅ ADD POINTS
        </button>
        <button
          onClick={redeem}
          disabled={card.points_balance < threshold || loading}
          className="w-full bg-purple-600 py-4 rounded-xl font-bold text-lg disabled:opacity-50"
        >
          🎁 REDEEM REWARD
        </button>
      </div>
    </div>
  );
}
