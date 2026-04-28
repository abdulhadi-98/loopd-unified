'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

export default function Scan() {
  const router = useRouter();
  const scannerRef = useRef(null);
  const [scanCount, setScanCount] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [manualQr, setManualQr] = useState('');

  useEffect(() => {
    const qr = new Html5Qrcode('qr-reader');
    scannerRef.current = qr;

    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => handleScan(decodedText),
      () => {}
    );

    return () => {
      qr.stop().catch(() => {});
    };
  }, []);

  async function handleScan(qrValue) {
    if (!scanning) return;
    setScanning(false);
    navigator.vibrate?.([100]);

    try {
      const token = localStorage.getItem('staffToken');
      const { data } = await axios.post('/api/scan', { qrValue }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      sessionStorage.setItem('scanned_data', JSON.stringify(data));
      setScanCount((c) => c + 1);
      router.push('/scan/customer');
    } catch (err) {
      alert(err.response?.data?.error || 'QR not found');
      setTimeout(() => setScanning(true), 2000);
    }
  }

  async function handleManual(e) {
    e.preventDefault();
    if (manualQr.trim()) await handleScan(manualQr.trim());
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 relative">
        <div id="qr-reader" className="w-full h-full" style={{ minHeight: '70vh' }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-white rounded-2xl opacity-70" />
        </div>
      </div>

      <div className="bg-gray-900 px-4 py-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm text-center mb-3">Today: {scanCount} scans</p>
        <form onSubmit={handleManual} className="flex gap-2">
          <input
            type="text"
            placeholder="Manual QR entry"
            value={manualQr}
            onChange={(e) => setManualQr(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          />
          <button type="submit" className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold">
            Go
          </button>
        </form>
        <button
          onClick={() => router.push('/scan/history')}
          className="w-full mt-2 text-gray-400 text-sm text-center py-2"
        >
          View History →
        </button>
      </div>
    </div>
  );
}
