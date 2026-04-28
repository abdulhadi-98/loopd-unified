'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import CustomerTable from '../../../../components/portal/CustomerTable';
import Link from 'next/link';

const SEGMENTS = ['all', 'active', 'at_risk', 'vip'];

export default function Customers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [segment, setSegment] = useState(searchParams.get('segment') || 'all');
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('staffToken')}` };
  }

  async function load() {
    setLoading(true);
    try {
      const { data: res } = await axios.get(
        `/api/dashboard/customers?segment=${segment}&page=${page}&limit=20`,
        { headers: authHeaders() }
      );
      setData(res);
    } catch {
      router.replace('/portal/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [segment, page]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-white">← Overview</Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {SEGMENTS.map((s) => (
          <button
            key={s}
            onClick={() => { setSegment(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
              segment === s ? 'bg-indigo-600' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading...</p>
      ) : (
        <>
          <CustomerTable customers={data?.customers || []} />
          <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
            <span>{data?.total || 0} total customers</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 bg-gray-800 rounded-lg disabled:opacity-50">Prev</button>
              <span>Page {page} / {data?.pages || 1}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.pages || 1)}
                className="px-3 py-1 bg-gray-800 rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
