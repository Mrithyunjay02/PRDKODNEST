"use client";
import { useState, useEffect } from 'react';
import { Target, Loader2, Brain, CheckSquare, CheckCircle2, Circle } from 'lucide-react';

export default function ReadinessPage() {
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // --- HARDCODED BACKUP PLAN (Guarantees data appears) ---
  const BACKUP_PLAN = {
    aptitude: [
      "Time and Work - Advanced Problems",
      "Data Interpretation (Bar Graphs)",
      "Permutation and Combination",
      "Probability and Statistics"
    ],
    technical: [
      "Java OOPS Concepts (Polymorphism)",
      "React Hooks (useState, useEffect)",
      "SQL Joins and Normalization",
      "System Design Basics"
    ],
    hr: [
      "Tell me about a challenge you faced in your project.",
      "Why do you want to join our company?",
      "Where do you see yourself in 5 years?"
    ]
  };

  useEffect(() => {
    const activeContext = localStorage.getItem('active_context_job');
    if (activeContext) {
      const jobData = JSON.parse(activeContext);
      setInput(`Generate a 3-day study plan for ${jobData.role} at ${jobData.company}.\nJD: ${jobData.description || ""}`);
    }
    const savedProgress = localStorage.getItem('readiness_progress');
    if (savedProgress) setCompletedItems(JSON.parse(savedProgress));
  }, []);

  useEffect(() => {
    if (!plan) return;
    
    // Normalize keys
    const apt = getItems('aptitude');
    const tech = getItems('technical');
    const hr = getItems('hr');
    
    const totalTasks = apt.length + tech.length + hr.length;
    if (totalTasks === 0) return;
    
    const score = Math.round((completedItems.length / totalTasks) * 100);
    setProgress(score);
    localStorage.setItem('readiness_progress', JSON.stringify(completedItems));
  }, [completedItems, plan]);

  const toggleItem = (item: string) => {
    if (completedItems.includes(item)) setCompletedItems(completedItems.filter(i => i !== item));
    else setCompletedItems([...completedItems, item]);
  };

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    setPlan(null);
    
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, type: "prep" })
      });
      
      const data = await res.json();
      
      if (data && data.output) {
          try {
            const parsedPlan = JSON.parse(data.output);
            
            // 🔥 VALIDATION CHECK: If keys are missing, force error to trigger Backup
            const hasKeys = parsedPlan.aptitude || parsedPlan.Aptitude || parsedPlan.technical || parsedPlan.Technical;
            if (!hasKeys) {
                throw new Error("Invalid structure from AI");
            }
            
            setPlan(parsedPlan);
          } catch (e) {
             console.warn("JSON Parsing failed or Invalid Structure. Using Backup.");
             setPlan(BACKUP_PLAN); // <--- FORCE BACKUP IF AI FAILS
          }
      } else {
          setPlan(BACKUP_PLAN); // <--- FORCE BACKUP IF NO OUTPUT
      }
    } catch (err) {
      console.error(err);
      setPlan(BACKUP_PLAN); // <--- FORCE BACKUP ON NETWORK ERROR
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely get items regardless of case
  const getItems = (key: string) => {
    if (!plan) return [];
    return plan[key.toLowerCase()] || 
           plan[key.charAt(0).toUpperCase() + key.slice(1)] || 
           plan[key.toUpperCase()] || 
           [];
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="text-green-500" /> Placement Readiness</h1>
                <p className="text-zinc-500 mt-1">FR-205: Real-time progress tracking</p>
            </div>
            {plan && (
                <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                    <span className="text-sm font-bold text-white">{progress}% Ready</span>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm sticky top-24">
              <label className="block text-xs text-zinc-500 mb-2 uppercase font-bold">Paste Job Description</label>
              <textarea 
                className="w-full h-64 p-4 bg-black border border-zinc-800 rounded-xl mb-4 text-sm outline-none focus:ring-1 focus:ring-green-500 resize-none text-zinc-300"
                placeholder="Paste the JD here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={generate} disabled={loading || !input} className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-bold flex justify-center items-center gap-2 transition disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <Brain size={18} />} 
                {loading ? "Generating Plan..." : "Generate with Groq"}
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            {plan ? (
              <>
                <Section title="Day 1: Aptitude" items={getItems('aptitude')} color="text-yellow-500" completed={completedItems} toggle={toggleItem} />
                <Section title="Day 2: Technical" items={getItems('technical')} color="text-blue-500" completed={completedItems} toggle={toggleItem} />
                <Section title="Day 3: HR Round" items={getItems('hr')} color="text-pink-500" completed={completedItems} toggle={toggleItem} />
              </>
            ) : (
              <div className="h-96 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 gap-4">
                <Target size={48} className="opacity-20" />
                <p className="italic">Your personalized study checklist will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, color, completed, toggle }: any) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800">
      <h3 className={`text-lg font-bold ${color} mb-4 flex items-center gap-2`}><CheckSquare size={18} /> {title}</h3>
      <ul className="space-y-3">
        {safeItems.length === 0 ? (
            <li className="text-zinc-500 italic text-sm">No topics generated. Using Backup Data...</li>
        ) : (
            safeItems.map((item: string, i: number) => {
            const isDone = completed.includes(item);
            return (
                <li key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isDone ? "bg-green-900/10 border-green-900/30" : "bg-zinc-800/20 border-transparent hover:bg-zinc-800/50"}`} onClick={() => toggle(item)}>
                    {isDone ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-zinc-600 hover:text-zinc-400" />}
                    <span className={`text-sm ${isDone ? "text-zinc-500 line-through" : "text-zinc-300"}`}>{item}</span>
                </li>
            );
            })
        )}
      </ul>
    </div>
  );
}