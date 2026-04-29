'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const nav = [
  { href: '/admin',    label: 'Overview',     icon: '◎' },
  { href: '/admin/restaurants',  label: 'Restaurants',  icon: '🏪' },
  { href: '/admin/analytics',    label: 'Analytics',    icon: '📊' },
  { href: '/admin/billing',      label: 'Plans & Billing', icon: '💳' },
  { href: '/admin/settings',     label: 'Settings',     icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem('saToken');
    localStorage.removeItem('saAdmin');
    router.push('/admin/login');
  }

  const admin = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('saAdmin') || '{}')
    : {};

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen fixed top-0 left-0">
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="text-xl font-black tracking-tight">
          Loopd <span className="text-violet-500">↑</span>
        </span>
        <p className="text-xs text-slate-500 mt-0.5">Superadmin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 mb-1">{admin.email}</p>
        <button onClick={logout}
          className="w-full text-left text-sm text-red-400 hover:text-red-300 transition py-1">
          Sign out
        </button>
      </div>
    </aside>
  );
}
