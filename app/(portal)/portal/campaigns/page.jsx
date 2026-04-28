'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const SEGMENTS = ['all', 'active', 'at_risk', 'vip'];

export default function Campaigns() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [segment, setSegment] = useState('all');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('staffToken')}` };
  }

  async function loadCampaigns() {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/campaign', { headers: authHeaders() });
      setCampaigns(data.campaigns);
    } catch { router.replace('/portal/login'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCampaigns(); }, []);

  async function send(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const { data } = await axios.post(
        '/api/campaign/send',
        { message, segment, title: `Message for ${segment} customers` },
        { headers: authHeaders() }
      );
      setResult(data);
      setMessage('');
      loadCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-white">← Overview</Link>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Send Message</h2>
        <form onSubmit={send} className="space-y-4">
          <div>
            <textarea
              placeholder="Your message (max 160 chars)"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 160))}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 text-right">{message.length}/160</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SEGMENTS.map((s) => (
              <button key={s} type="button" onClick={() => setSegment(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                  segment === s ? 'bg-indigo-600' : 'bg-gray-800 text-gray-400'
                }`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button type="submit" disabled={sending || !message.trim()}
            className="w-full bg-indigo-600 py-3 rounded-xl font-semibold disabled:opacity-50">
            {sending ? 'Sending...' : 'Send Now'}
          </button>
          {result && (
            <p className="text-green-400 text-sm text-center">
              Sent to {result.sent} customers ({result.failed} failed)
            </p>
          )}
        </form>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Campaign History</h2>
        {loading ? <p className="text-gray-400">Loading...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-800">
                <th className="pb-2">Message</th>
                <th className="pb-2">Segment</th>
                <th className="pb-2">Sent</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="py-3 max-w-xs truncate">{c.message}</td>
                  <td className="py-3 capitalize">{c.segment}</td>
                  <td className="py-3">{c.sent_count}</td>
                  <td className="py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
