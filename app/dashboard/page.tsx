"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, FileText, CheckCircle, Clock, Target, 
  ArrowUpRight, Database, Bell, Shield, Activity
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    saved: 0,
    applied: 0,
    interviews: 0,
    offers: 0,
    resumeCount: 0,
    prepProgress: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [profileName, setProfileName] = useState("User");

  // Load Data on Mount
  useEffect(() => {
    // 1. Load Profile
    const profile = localStorage.getItem("user_profile");
    if (profile) {
      setProfileName(JSON.parse(profile).name || "User");
    }

    // 2. Load Jobs Stats
    const jobs = JSON.parse(localStorage.getItem("my_jobs") || "[]");
    const saved = jobs.filter((j: any) => j.status === "Saved").length;
    const applied = jobs.filter((j: any) => j.status === "Applied").length;
    const interviews = jobs.filter((j: any) => j.status === "Interview").length;
    const offers = jobs.filter((j: any) => j.status === "Offer").length;

    // 3. Load Resume History
    const resumes = JSON.parse(localStorage.getItem("resume_history") || "[]");

    // 4. Load Prep Progress
    const completedPrep = JSON.parse(localStorage.getItem("readiness_progress") || "[]");
    
    setStats({
      saved,
      applied,
      interviews,
      offers,
      resumeCount: resumes.length,
      prepProgress: completedPrep.length * 5 // Rough estimate: 5% per task
    });

    // 5. Build Activity Feed (The Crash Fix is Here)
    const jobLogs = jobs.slice(-3).reverse().map((j: any) => ({
        id: j.id,
        type: 'job',
        message: `Tracked new role at ${j.company}`,
        time: '2h ago', // Static for demo, or use j.date
        icon: <Briefcase size={14} className="text-blue-400" />
    }));

    const resumeLogs = resumes.slice(-3).reverse().map((r: any) => ({
        id: r.id,
        type: 'resume',
        // 🔥 FIX: Check if jdSnippet exists before substring
        message: `Generated ATS Resume: ${(r.jdSnippet || "Untitled Job").substring(0, 20)}...`,
        time: r.timestamp?.split(',')[0] || 'Just now',
        icon: <FileText size={14} className="text-purple-400" />
    }));

    // Merge and sort logs
    const combinedLogs = [...jobLogs, ...resumeLogs].sort((a, b) => b.id - a.id).slice(0, 5);
    setRecentActivity(combinedLogs);

  }, []);

  // Mock Data for the Chart
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Readiness Score",
        data: [65, 68, 70, 72, 75, 78, stats.prepProgress || 80],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { display: false },
      x: { display: false }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
     {/* Header */}
     <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profileName} 👋</h1>
            <p className="text-zinc-500 mt-2">Here is your daily placement breakdown.</p>
          </div>
          <div className="flex gap-3">
             {/* System Status - Now Links to Admin Page (if you have access) or just shows a tooltip */}
             <div className="group relative">
                 <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 flex items-center gap-2 cursor-help transition-colors hover:border-green-500/50">
                    <Shield size={14} className="text-green-500" /> System Operational
                 </div>
                 {/* Tooltip on Hover */}
                 <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                    <p className="flex justify-between mb-1"><span>API:</span> <span className="text-green-500">Online</span></p>
                    <p className="flex justify-between"><span>Database:</span> <span className="text-green-500">Connected</span></p>
                 </div>
             </div>

             {/* Notifications - Now Links to Settings */}
             <Link href="/settings">
                 <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 flex items-center gap-2 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer">
                    <Bell size={14} className="text-blue-500" /> Settings
                 </div>
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Applications" value={stats.applied} sub="Active" icon={<Briefcase size={20} className="text-blue-500" />} />
          <StatCard title="Interviews" value={stats.interviews} sub="Scheduled" icon={<Clock size={20} className="text-orange-500" />} />
          <StatCard title="Offers" value={stats.offers} sub="Received" icon={<CheckCircle size={20} className="text-green-500" />} />
          <StatCard title="Resumes Built" value={stats.resumeCount} sub="Versions" icon={<FileText size={20} className="text-purple-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Navigation Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Job Ingestion (Pink Glow) */}
                <Link href="/feed">
                    <div className="group h-full bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 hover:border-pink-500/50 hover:ring-1 hover:ring-pink-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500 group-hover:scale-110 transition-transform">
                        <Database size={24} />
                        </div>
                        <div>
                        <h3 className="text-xl font-bold text-white">Job Ingestion</h3>
                        <p className="text-xs text-zinc-500">FR-101: Scheduled source ingestion.</p>
                        </div>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full w-2/3 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                    </div>
                    </div>
                </Link>

                {/* 2. Tracker (Blue Glow) */}
                <Link href="/tracker">
                    <div className="group h-full bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                        <Target size={24} />
                        </div>
                        <div>
                        <h3 className="text-xl font-bold text-white">App Tracker</h3>
                        <p className="text-xs text-zinc-500">FR-107: Kanban board tracking.</p>
                        </div>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-1/2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                    </div>
                </Link>

                 {/* 3. Resume Builder (Purple Glow) */}
                 <Link href="/resume">
                    <div className="group h-full bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 hover:border-purple-500/50 hover:ring-1 hover:ring-purple-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                        </div>
                        <div>
                        <h3 className="text-xl font-bold text-white">AI Resume</h3>
                        <p className="text-xs text-zinc-500">FR-302: ATS-friendly builder.</p>
                        </div>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full w-3/4 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    </div>
                    </div>
                </Link>

                 {/* 4. Prep Readiness (Green Glow) */}
                 <Link href="/readiness">
                    <div className="group h-full bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 hover:border-green-500/50 hover:ring-1 hover:ring-green-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500 group-hover:scale-110 transition-transform">
                        <CheckCircle size={24} />
                        </div>
                        <div>
                        <h3 className="text-xl font-bold text-white">Prep & Readiness</h3>
                        <p className="text-xs text-zinc-500">FR-204: AI study plans.</p>
                        </div>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                    </div>
                </Link>

            </div>

            {/* Right Column: Activity & Charts */}
            <div className="space-y-6">
                
                {/* Readiness Chart */}
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Readiness Trend</h3>
                        <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                            <ArrowUpRight size={12} /> +12%
                        </span>
                    </div>
                    <div className="h-32 w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 h-full">
                    <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Activity size={14} /> Recent Activity
                    </h3>
                    <div className="space-y-6 relative border-l border-zinc-800 ml-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-zinc-600 text-xs italic pl-6">No activity recorded yet.</p>
                        ) : (
                            recentActivity.map((log, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600"></div>
                                    <p className="text-sm font-medium text-zinc-200">{log.message}</p>
                                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                        {log.icon} {log.time}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Stat Component
function StatCard({ title, value, sub, icon }: any) {
    return (
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <h2 className="text-3xl font-bold text-white mt-1">{value}</h2>
                </div>
                <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400">
                    {icon}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
                <span className="text-zinc-600 text-xs">{sub}</span>
            </div>
        </div>
    );
}