"use client";
import { useState, useEffect } from 'react';
import { Target, Loader2, Brain, CheckSquare, CheckCircle2, Circle } from 'lucide-react';

export default function ReadinessPage() {
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [userRole, setUserRole] = useState("Software Engineer");

  // --- HARDCODED BACKUP PLAN (Guarantees data appears if API fails) ---
  const BACKUP_PLAN = {
    day1: [
      { topics: "Time and Work - Advanced Problems", time: "45 mins", problems: "Practice 5 questions" },
      { topics: "Data Interpretation (Bar Graphs)", time: "30 mins", problems: "Solve 2 sets" },
      { topics: "Permutation and Combination", time: "45 mins", problems: "Basic formulas" }
    ],
    day2: [
      { topics: "Java OOPS Concepts (Polymorphism)", time: "60 mins", problems: "Implement an interface" },
      { topics: "React Hooks (useState, useEffect)", time: "60 mins", problems: "Build a counter app" },
      { topics: "SQL Joins and Normalization", time: "45 mins", problems: "Write 3 join queries" }
    ],
    day3: [
      { topics: "Tell me about a challenge you faced.", time: "30 mins", problems: "Prepare STAR method answer" },
      { topics: "Why do you want to join our company?", time: "30 mins", problems: "Research company values" },
      { topics: "System Design Basics", time: "60 mins", problems: "Design a URL shortener" }
    ]
  };

  useEffect(() => {
    // 1. Load User Profile for Role
    if (typeof window !== "undefined") {
      const profile = localStorage.getItem("user_profile");
      if (profile) {
        const parsed = JSON.parse(profile);
        setUserRole(parsed.targetRole || "Software Engineer");
      }

      // 2. Load Active Context (Job Description)
      const activeContext = localStorage.getItem('active_context_job');
      if (activeContext) {
        const jobData = JSON.parse(activeContext);
        setInput(`Generate a 3-day study plan for ${jobData.role} at ${jobData.company}.\nJD: ${jobData.description || ""}`);
      }

      // 3. Load Progress
      const savedProgress = localStorage.getItem('readiness_progress');
      if (savedProgress) setCompletedItems(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    if (!plan) return;
    
    // Normalize keys to handle different API responses
    const d1 = getItems('day1');
    const d2 = getItems('day2');
    const d3 = getItems('day3');
    
    const totalTasks = d1.length + d2.length + d3.length;
    if (totalTasks === 0) return;
    
    const score = Math.round((completedItems.length / totalTasks) * 100);
    setProgress(score);
    localStorage.setItem('readiness_progress', JSON.stringify(completedItems));
  }, [completedItems, plan]);

  const toggleItem = (itemId: string) => {
    if (completedItems.includes(itemId)) {
      setCompletedItems(completedItems.filter(i => i !== itemId));
    } else {
      setCompletedItems([...completedItems, itemId]);
    }
  };

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    
    try {
      const res = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            messages: [{ role: 'user', content: input }],
            userRole: userRole 
        })
      });

      if (!res.ok) throw new Error("API Failed");
      
      const text = await res.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsedPlan = JSON.parse(jsonMatch[0]);
            
            // 🔥 VALIDATION: Check if the plan actually has data keys
            const keys = Object.keys(parsedPlan).map(k => k.toLowerCase());
            const hasValidKeys = keys.some(k => k.includes('day') || k.includes('aptitude') || k.includes('technical'));
            
            if (!hasValidKeys) throw new Error("Empty or Invalid JSON Plan");

            setPlan(parsedPlan);
        } else {
             throw new Error("No JSON found");
        }
      } catch (e) {
         console.warn("JSON Parsing failed or Invalid Structure. Using Backup.");
         setPlan(BACKUP_PLAN);
      }

    } catch (err) {
      console.error("Network Error:", err);
      setPlan(BACKUP_PLAN);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely get items regardless of case or key variations
  const getItems = (key: string) => {
    if (!plan) return [];
    
    const lowerKey = key.toLowerCase(); 

    // Map the requested key to ALL possible variations the AI might return
    const variations: Record<string, string[]> = {
        'day1': ['day1', 'day 1', 'Day 1', 'day_1', 'aptitude', 'Aptitude', 'Core Concepts'],
        'day2': ['day2', 'day 2', 'Day 2', 'day_2', 'technical', 'Technical', 'Advanced'],
        'day3': ['day3', 'day 3', 'Day 3', 'day_3', 'hr', 'HR', 'system design', 'System Design']
    };

    const searchKeys = variations[lowerKey] || [key];

    // Look for the first matching key in the plan object
    for (const k of searchKeys) {
        // Check exact match
        if (plan[k]) return plan[k];
        
        // Check case-insensitive match inside keys
        const planKey = Object.keys(plan).find(pk => pk.toLowerCase() === k.toLowerCase());
        if (planKey && plan[planKey]) return plan[planKey];
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Target className="text-green-500" /> Placement Readiness
                </h1>
                <p className="text-zinc-500 mt-1">FR-205: {userRole} Preparation Tracker</p>
            </div>
            {plan && (
                <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-white leading-none">{progress}%</span>
                        <span className="text-xs text-zinc-500 uppercase">Ready</span>
                    </div>
                    {/* Simple Circular Progress Visual */}
                    <div className="w-10 h-10 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-4 border-green-500" 
                             style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}></div>
                    </div>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm sticky top-24">
              <label className="block text-xs text-zinc-500 mb-2 uppercase font-bold">Target Role Context</label>
              <div className="mb-4 px-3 py-2 bg-zinc-950 rounded border border-zinc-800 text-sm text-zinc-300">
                 {userRole}
              </div>

              <label className="block text-xs text-zinc-500 mb-2 uppercase font-bold">Job Description / Prompt</label>
              <textarea 
                className="w-full h-48 p-4 bg-black border border-zinc-800 rounded-xl mb-4 text-sm outline-none focus:ring-1 focus:ring-green-500 resize-none text-zinc-300"
                placeholder="Paste the JD here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={generate} disabled={loading || !input} className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-bold flex justify-center items-center gap-2 transition disabled:opacity-50 text-white shadow-lg shadow-green-900/20">
                {loading ? <Loader2 className="animate-spin" /> : <Brain size={18} />} 
                {loading ? "Analyzing Strategy..." : "Generate Study Plan"}
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            {plan ? (
              <>
                <Section title="Day 1: Aptitude & Core" items={getItems('day1')} color="text-yellow-500" completed={completedItems} toggle={toggleItem} />
                <Section title="Day 2: Advanced Technical" items={getItems('day2')} color="text-blue-500" completed={completedItems} toggle={toggleItem} />
                <Section title="Day 3: HR & System Design" items={getItems('day3')} color="text-pink-500" completed={completedItems} toggle={toggleItem} />
              </>
            ) : (
              <div className="h-96 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 gap-4 bg-zinc-900/20">
                <Target size={48} className="opacity-20" />
                <p className="italic">Paste a Job Description to generate your checklist.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated Section to handle Objects safely
function Section({ title, items, color, completed, toggle }: any) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className={`text-lg font-bold ${color} mb-4 flex items-center gap-2`}>
        <CheckSquare size={18} /> {title}
        <span className="text-xs bg-zinc-950 text-zinc-500 px-2 py-1 rounded-full ml-auto">{safeItems.length} Tasks</span>
      </h3>
      <ul className="space-y-3">
        {safeItems.length === 0 ? (
            <li className="text-zinc-500 italic text-sm">No topics generated.</li>
        ) : (
            safeItems.map((item: any, i: number) => {
            // Check if item is an object (New API) or string (Legacy)
            const isObject = typeof item === 'object' && item !== null;
            const content = isObject ? (item.topics || item.concept) : item;
            const subtext = isObject ? item.problems : "";
            const time = isObject ? item.time : "";

            // Create unique ID based on content hash or index
            const uniqueId = `${title}-${i}`;
            const isDone = completed.includes(uniqueId);
            
            return (
                <li key={i} 
                    className={`group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        isDone ? "bg-green-900/10 border-green-900/30" : "bg-zinc-800/20 border-transparent hover:bg-zinc-800/50"
                    }`} 
                    onClick={() => toggle(uniqueId)}
                >
                    <div className="mt-0.5">
                        {isDone ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-zinc-600 group-hover:text-zinc-400" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <span className={`text-sm font-medium ${isDone ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                {content}
                            </span>
                            {time && <span className="text-xs text-zinc-500 font-mono bg-zinc-950 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{time}</span>}
                        </div>
                        {subtext && !isDone && (
                            <p className="text-xs text-zinc-500 mt-1 pl-1 border-l-2 border-zinc-700">
                                Focus: {subtext}
                            </p>
                        )}
                    </div>
                </li>
            );
            })
        )}
      </ul>
    </div>
  );
}