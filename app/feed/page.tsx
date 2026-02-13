"use client";
import { useState, useEffect } from "react";
import {
  CloudDownload,
  Plus,
  RefreshCw,
  Database,
  MapPin,
  Clock,
  Briefcase,
  AlertOctagon,
  ExternalLink
} from "lucide-react";

// 🔥 NOTE: For this to work in the browser, ensure your env var is NEXT_PUBLIC_X_RAPIDAPI_KEY in Netlify
// If not, it will gracefully default to the FALLBACK_JOBS which is fine for the demo.
const RAPID_API_KEY = process.env.NEXT_PUBLIC_X_RAPIDAPI_KEY || process.env.X_RAPIDAPI_KEY;

// Fallback Data (Safe Mode)
const FALLBACK_JOBS = [
  { id: 201, role: "Python Backend Developer", company: "Razorpay", location: "Bangalore", source: "LinkedIn", type: "Full-time", posted: "1h ago", rawDate: new Date() },
  { id: 202, role: "Frontend Engineer (React)", company: "Cred", location: "Bangalore", source: "Indeed", type: "Full-time", posted: "2h ago", rawDate: new Date() },
  { id: 203, role: "Data Scientist", company: "PhonePe", location: "Pune", source: "Naukri", type: "Full-time", posted: "4h ago", rawDate: new Date() },
  { id: 204, role: "Graduate Analyst", company: "Barclays", location: "Chennai", source: "LinkedIn", type: "Fresher", posted: "5h ago", rawDate: new Date() },
  { id: 205, role: "Software Development Engineer 1", company: "Amazon", location: "Hyderabad", source: "Amazon Jobs", type: "Full-time", posted: "6h ago", rawDate: new Date() },
  { id: 206, role: "React Native Intern", company: "Groww", location: "Bangalore", source: "Instahyre", type: "Internship", posted: "7h ago", rawDate: new Date() },
  { id: 207, role: "Full Stack Developer", company: "Zerodha", location: "Remote", source: "LinkedIn", type: "Full-time", posted: "8h ago", rawDate: new Date() },
  { id: 208, role: "Associate Consultant", company: "KPMG", location: "Gurgaon", source: "Naukri", type: "Full-time", posted: "9h ago", rawDate: new Date() },
  { id: 209, role: "Java Developer", company: "TCS", location: "Mumbai", source: "TCS Careers", type: "Full-time", posted: "10h ago", rawDate: new Date() },
  { id: 210, role: "Cloud Support Associate", company: "Microsoft", location: "Bangalore", source: "LinkedIn", type: "Full-time", posted: "12h ago", rawDate: new Date() },
];

export default function JobFeedPage() {
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [feed, setFeed] = useState<any[]>([]);
  const [trackedSignatures, setTrackedSignatures] = useState<Set<string>>(new Set());
  const [userPrefs, setUserPrefs] = useState<any>(null);

  useEffect(() => {
    // 1. Browser Safety Check
    if (typeof window !== "undefined") {
      
      // Load Profile
      const profile = localStorage.getItem("user_profile");
      if (profile) setUserPrefs(JSON.parse(profile));
  
      // Load Tracked Jobs
      const savedJobs = localStorage.getItem("my_jobs");
      if (savedJobs) {
        try {
          const jobs = JSON.parse(savedJobs);
          // 2. Strict Type Safety Fix for the Build
          const signatures = new Set<string>(
            jobs.map((j: any) => {
               const role = j.title || j.role || ""; 
               const company = j.company || "";
               return `${company.toLowerCase().trim()}|${role.toLowerCase().trim()}` as string;
            })
          );
          setTrackedSignatures(signatures);
        } catch (e) {
          console.error("Failed to parse jobs:", e);
        }
      }
    }
  }, []); 

  const calculateRelevance = (job: any) => {
    if (!userPrefs) return 50;
    let score = 40; // Base score
    const targetRole = (userPrefs.targetRole || "").toLowerCase().trim();
    const prefLocation = (userPrefs.location || "").toLowerCase().trim();
    const jobRole = job.role.toLowerCase();
    const jobLoc = job.location.toLowerCase();

    if (targetRole && jobRole.includes(targetRole)) score += 30;
    if (prefLocation && jobLoc.includes(prefLocation)) score += 20;
    
    // Boost for known big tech
    if (['google', 'amazon', 'microsoft', 'swiggy', 'cred', 'zerodha'].some(c => job.company.toLowerCase().includes(c))) {
        score += 10;
    }

    return Math.min(score, 98);
  };

  const fetchRealJobs = async () => {
    // 🔥 FIX: Re-read localStorage RIGHT NOW to get the latest Role/Location
    const latestProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
    
    // 👇 BRIDGE FIX: READ ADMIN CONFIG FROM LOCAL STORAGE 👇
    // This reads the "Power Button" settings you saved in the Admin Panel
    const adminSettings = JSON.parse(localStorage.getItem("admin_source_config") || "{}");
    
    // Check which sources are allowed (Default to TRUE if not set)
    const enableLinkedIn = adminSettings.linkedin !== false; 
    const enableNaukri = adminSettings.naukri !== false;
    const enableIndeed = adminSettings.indeed !== false;
    const enableInstahyre = adminSettings.instahyre !== false;

    // Helper function to filter jobs
    const isSourceAllowed = (source: string) => {
        const s = (source || "").toLowerCase();
        if (!enableLinkedIn && (s.includes("linkedin"))) return false;
        if (!enableNaukri && (s.includes("naukri"))) return false;
        if (!enableIndeed && (s.includes("indeed"))) return false;
        if (!enableInstahyre && (s.includes("instahyre"))) return false;
        return true;
    };

    // Filter Fallback Jobs immediately based on Admin Settings
    const filteredFallback = FALLBACK_JOBS.filter(job => isSourceAllowed(job.source));

    // Construct search query
    const roleQuery = latestProfile.targetRole || "Software Engineer";
    const locQuery = latestProfile.location || "India";
    const query = `${roleQuery} in ${locQuery}`;
    
    console.log("Searching for:", query);

    if (!RAPID_API_KEY || RAPID_API_KEY.includes("PASTE")) {
        console.warn("Using Fallback Data (API Key missing)");
        return filteredFallback;
    }

    try {
        const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPID_API_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        });

        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
            const jobs = data.data.map((j: any, index: number) => ({
                id: Date.now() + index,
                role: j.job_title,
                company: j.employer_name,
                location: j.job_city || j.job_country || "Remote",
                source: j.job_publisher || "LinkedIn",
                type: j.job_employment_type || "Full-time",
                posted: "Just now",
                rawDate: new Date(),
                url: j.job_apply_link
            }));

            // 👇 APPLY ADMIN FILTER TO LIVE RESULTS 👇
            return jobs.filter((job: any) => isSourceAllowed(job.source));
        }
        return filteredFallback;
    } catch (error) {
        console.error("API Error, using fallback", error);
        return filteredFallback;
    }
  };

  const runIngestionPipeline = async () => {
    setIsIngesting(true);
    setIngestionProgress(10);
    setFeed([]);

    const latestProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
    setUserPrefs(latestProfile);

    const rawJobs = await fetchRealJobs();
    setIngestionProgress(60);

    setTimeout(() => {
        const scoredJobs = rawJobs
            .map((job) => ({
              ...job,
              matchScore: calculateRelevance(job), 
            }))
            .sort((a, b) => b.matchScore - a.matchScore);

        setFeed(scoredJobs);
        setIngestionProgress(100);
        setTimeout(() => setIsIngesting(false), 500);
    }, 1500);
  };

  const addToTracker = (job: any) => {
    const existingData = localStorage.getItem("my_jobs");
    const currentJobs = existingData ? JSON.parse(existingData) : [];

    const newJob = {
      id: Date.now(),
      title: job.role, 
      company: job.company,
      status: "Saved",
      date: new Date().toISOString().split("T")[0],
    };

    localStorage.setItem("my_jobs", JSON.stringify([...currentJobs, newJob]));
    
    // Active Context
    localStorage.setItem('active_context_job', JSON.stringify({
        role: job.role,
        company: job.company,
        description: `Role: ${job.role} at ${job.company}. Location: ${job.location}.`
    }));

    const newSig = `${job.company.toLowerCase().trim()}|${job.role.toLowerCase().trim()}`;
    setTrackedSignatures((prev) => new Set(prev).add(newSig));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="text-pink-500" /> Source Ingestion Pipeline
            </h1>
            <p className="text-zinc-500 mt-1">
              FR-103 + FR-104: Aggregating Live Sources
            </p>
          </div>

          <button
            onClick={runIngestionPipeline}
            disabled={isIngesting}
            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-900/20"
          >
            {isIngesting ? <RefreshCw className="animate-spin" /> : <CloudDownload />}
            {isIngesting ? "Fetching Live Data..." : "Run Live Ingestion"}
          </button>
        </div>

        {/* Progress Bar */}
        {isIngesting && (
          <div className="mb-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 animate-pulse">
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>Contacting JSearch API / LinkedIn Scrapers...</span>
              <span>{ingestionProgress}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${ingestionProgress}%` }} />
            </div>
          </div>
        )}

        {/* Job Feed */}
        <div className="grid grid-cols-1 gap-4">
          {feed.length > 0 ? (
            feed.map((job) => {
              const signature = `${job.company.toLowerCase().trim()}|${job.role.toLowerCase().trim()}`;
              const isDuplicate = trackedSignatures.has(signature);
              const isHighMatch = job.matchScore >= 80;
              const scoreColor = isHighMatch ? "#22c55e" : "#eab308";
              const textColor = isHighMatch ? "text-green-500" : "text-yellow-500";

              return (
                <div key={job.id} className={`backdrop-blur-sm border p-6 rounded-xl flex items-center justify-between transition-all ${isDuplicate ? "bg-zinc-900/20 border-zinc-800/50 opacity-60" : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"}`}>
                  <div className="flex items-center gap-6">
                    {/* Score Circle */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#333" strokeWidth="4" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke={scoreColor} strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (job.matchScore / 100) * 175.9} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${textColor}`}>{job.matchScore}%</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {job.role}
                          {job.url && <a href={job.url} target="_blank" className="text-zinc-500 hover:text-white"><ExternalLink size={14}/></a>}
                      </h3>
                      <p className="text-zinc-400 flex items-center gap-2">
                        <Briefcase size={14} /> {job.company}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-zinc-500">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {job.posted}</span>
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{job.source}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToTracker(job)}
                    disabled={isDuplicate}
                    className={`px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${isDuplicate ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700" : "bg-white text-black hover:bg-zinc-200"}`}
                  >
                    {isDuplicate ? <AlertOctagon size={18} /> : <Plus size={18} />}
                    {isDuplicate ? "Tracked" : "Track"}
                  </button>
                </div>
              );
            })
          ) : (
            !isIngesting && (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <Database size={48} className="mx-auto mb-4 opacity-20" />
                <p>Click "Run Live Ingestion" to fetch jobs from sources.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}