"use client";
import { useState, useEffect } from 'react';
import { Save, User, Briefcase, Code2, Globe, Bell, Mail, Clock, Shield, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // FR-401 & FR-105: Full Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    targetRole: "",
    skills: "",
    location: "",
    notifications: {
      instant: true,
      dailyDigest: false,
      weeklyReport: true,
      appUpdates: true
    }
  });

  useEffect(() => {
    // Load existing profile from LocalStorage
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile({
        ...parsed,
        notifications: parsed.notifications || {
          instant: true,
          dailyDigest: false,
          weeklyReport: true,
          appUpdates: true
        }
      });
    } else {
      // Default / Placeholder Data
      setProfile({
        name: "Mrithyunjay",
        email: "student@pesitm.edu",
        targetRole: "Python Developer",
        skills: "Python, Django, React, SQL",
        location: "Bangalore",
        notifications: {
          instant: true,
          dailyDigest: false,
          weeklyReport: true,
          appUpdates: true
        }
      });
    }
  }, []);

  const handleToggle = (key: string) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications]
      }
    }));
  };

  const handleSave = () => {
    setLoading(true);
    // FR-401: Save to LocalStorage so Job Feed can read it
    localStorage.setItem('user_profile', JSON.stringify(profile));
    
    setTimeout(() => {
      setLoading(false);
      alert("Settings Saved! Job Feed and Resume Context Updated.");
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User className="text-blue-500" /> Account & Preferences
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Personal Details (FR-401) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                <Shield size={18} /> Personal Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                  <input 
                    type="text" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <Briefcase size={14} /> Target Role
                </label>
                <input 
                  type="text" 
                  value={profile.targetRole}
                  onChange={(e) => setProfile({...profile, targetRole: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <Code2 size={14} /> Key Skills
                </label>
                <input 
                  type="text" 
                  value={profile.skills}
                  onChange={(e) => setProfile({...profile, skills: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-green-500 outline-none transition-colors"
                  placeholder="e.g. React, Python, Java"
                />
              </div>

               <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <Globe size={14} /> Preferred Location
                </label>
                <input 
                  type="text" 
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-pink-500 outline-none transition-colors"
                  placeholder="e.g. Bangalore, Remote"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Notifications (FR-105) */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                <Bell size={18} /> Notifications
              </h2>
              <p className="text-xs text-zinc-500">FR-105: User preference rules govern send cadence.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Bell size={16} /></div>
                        <div>
                            <p className="text-sm font-bold">Instant Alerts</p>
                            <p className="text-[10px] text-zinc-500">For high-match jobs</p>
                        </div>
                    </div>
                    <Toggle active={profile.notifications?.instant} onClick={() => handleToggle('instant')} />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Clock size={16} /></div>
                        <div>
                            <p className="text-sm font-bold">Daily Digest</p>
                            <p className="text-[10px] text-zinc-500">Summary at 9 AM</p>
                        </div>
                    </div>
                    <Toggle active={profile.notifications?.dailyDigest} onClick={() => handleToggle('dailyDigest')} />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Mail size={16} /></div>
                        <div>
                            <p className="text-sm font-bold">Weekly Report</p>
                            <p className="text-[10px] text-zinc-500">Performance stats</p>
                        </div>
                    </div>
                    <Toggle active={profile.notifications?.weeklyReport} onClick={() => handleToggle('weeklyReport')} />
                </div>
              </div>
            </div>

            {/* PREMIUM SAVE BUTTON */}
            <button 
              onClick={handleSave}
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-xl"
            >
              <div className={`relative w-full py-4 font-bold flex items-center justify-center gap-3 transition-all duration-300 border border-white/10
                ${loading 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-500/20"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-blue-200 group-hover:rotate-12 transition-transform" />
                    <span className="tracking-wide">Save All Changes</span>
                    <Save className="w-5 h-5 opacity-70" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Toggle Component
function Toggle({ active, onClick }: { active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${active ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-zinc-700"}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${active ? "translate-x-6" : "translate-x-0"}`} />
        </button>
    );
}