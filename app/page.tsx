"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (name.trim()) {
      // Save user to local storage so other pages can use it
      localStorage.setItem('user_profile', JSON.stringify({
         name: name,
         email: "", // Will be filled in Settings
         targetRole: "Developer",
         skills: "",
         location: "",
         notifications: { instant: true, dailyDigest: false }
      }));
      
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience (The Stars) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black z-0 pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* THE BOUNCY CARD */}
      <div className="z-10 relative group">
        
        {/* Glow Effect behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        
        <div 
            className="relative bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800 w-[400px] text-center shadow-2xl
            transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
            group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-blue-500/20"
        >
            {/* Logo Icon with Spin Effect */}
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-700 group-hover:rotate-12 transition-transform duration-500">
                <Shield className="text-blue-500 w-8 h-8" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-2">
                KodNest Careers
            </h1>
            <p className="text-zinc-500 text-sm mb-8">
                Enter your name to access your Placement Command Center
            </p>

            <div className="space-y-4">
                <div className="relative group/input">
                    <input 
                        type="text" 
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-zinc-600"
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    {/* Tiny sparkle icon appearing when typing */}
                    {name.length > 0 && <Sparkles size={16} className="absolute right-4 top-4 text-yellow-500 animate-pulse" />}
                </div>

                <button 
                    onClick={handleLogin}
                    disabled={!name.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-lg shadow-blue-600/20"
                >
                    Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      </div>

      {/* Footer Credit */}
      <p className="absolute bottom-8 text-zinc-600 text-xs">
         Powered by <span className="text-zinc-400 font-bold">KodNest AI Engine</span>
      </p>
    </div>
  );
}