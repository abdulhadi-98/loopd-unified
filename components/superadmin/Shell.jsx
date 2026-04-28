'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

export default function Shell({ children }) {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem('saToken')) router.replace('/login');
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
