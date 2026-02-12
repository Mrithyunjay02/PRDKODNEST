"use client";
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function GlobalNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on Login page
  if (pathname === '/') return null;

  const handleLogout = () => {
    // Clear session and redirect to login root
    localStorage.removeItem('user_profile');
    router.push('/');
  };

  const isDashboard = pathname === '/dashboard';

  return (
    <nav className="fixed top-6 right-6 z-[100] flex items-center gap-4">
      {/* BACK TO HUB: Only visible when NOT on the dashboard */}
      {!isDashboard && (
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 text-zinc-400 hover:text-white rounded-full backdrop-blur-xl shadow-2xl transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Back to Hub</span>
        </Link>
      )}

      {/* LOGOUT BUTTON: Positioned on the right as per your latest screenshot */}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-500 rounded-full backdrop-blur-xl shadow-2xl transition-all group"
      >
        <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
        <span className="text-sm font-bold tracking-tight">Logout</span>
      </button>
    </nav>
  );
}