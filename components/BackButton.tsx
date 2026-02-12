"use client";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push('/dashboard')}
      className="fixed top-8 left-8 z-[100] flex items-center gap-2 px-5 py-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 text-zinc-400 hover:text-white rounded-full transition-all backdrop-blur-xl group shadow-2xl hover:scale-105 active:scale-95"
    >
      {/* Icon changes to ArrowLeft for "Back" behavior */}
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span className="text-sm font-bold tracking-tight">Back to Hub</span>
    </button>
  );
}