"use client";
import { useState, useEffect } from 'react';
import { ShieldAlert, Server, Activity, Power, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  
  // FR-108: Source Configurations
  const [sources, setSources] = useState({
    linkedin: true,
    naukri: true,
    indeed: true,
    instahyre: true
  });

  useEffect(() => {
    // Load config from "Server" (LocalStorage)
    const savedConfig = localStorage.getItem('admin_source_config');
    if (savedConfig) setSources(JSON.parse(savedConfig));
  }, []);

  const toggleSource = (key: string) => {
    const newConfig = { ...sources, [key as keyof typeof sources]: !sources[key as keyof typeof sources] };
    setSources(newConfig);
    // Save globally so Feed page can read it
    localStorage.setItem('admin_source_config', JSON.stringify(newConfig));
  };

  const handleLogin = () => {
    if (password === "admin123") setIsAdmin(true);
    else alert("Invalid Password (Hint: admin123)");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
          <p className="text-zinc-500 mb-6">Enter admin credentials to manage system pipelines.</p>
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mb-4 focus:border-red-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all">
            Access Control Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-red-500">
              <ShieldAlert /> Admin Console
            </h1>
            <p className="text-zinc-500 mt-1">FR-108: Source Management Interface</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="px-4 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition">
            Exit Admin Mode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Activity className="text-blue-500" /> System Health
            </h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">API Latency</span>
                  <span className="text-green-500 font-mono text-sm">24ms</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Ingestion Worker</span>
                  <span className="text-green-500 font-mono text-sm">Active</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Active Connectors</span>
                  <span className="text-white font-mono text-sm">{Object.values(sources).filter(Boolean).length} / 4</span>
               </div>
            </div>
          </div>

          {/* Source Toggle Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Server className="text-purple-500" /> Source Connectors
            </h2>
            <div className="space-y-4">
              {Object.keys(sources).map((key) => (
                <div key={key} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${sources[key as keyof typeof sources] ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} />
                        <span className="capitalize font-bold text-zinc-200">{key}</span>
                    </div>
                    
                    <button 
                        onClick={() => toggleSource(key)}
                        className={`p-2 rounded-lg transition-all ${sources[key as keyof typeof sources] ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"}`}
                        title={sources[key as keyof typeof sources] ? "Disable Source" : "Enable Source"}
                    >
                        <Power size={18} />
                    </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}