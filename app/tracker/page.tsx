"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, FileText, Target, Trash2, X, Briefcase, Mail, Copy, Check
} from 'lucide-react';

export default function TrackerPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>({ name: "Candidate" });
  
  // Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  // Data for Modals
  const [newJob, setNewJob] = useState({ title: "", company: "" });
  const [selectedJobForEmail, setSelectedJobForEmail] = useState<any>(null);
  const [emailTemplate, setEmailTemplate] = useState("cold"); // 'cold', 'followup', 'thankyou'
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('my_jobs');
    if (saved) setJobs(JSON.parse(saved));

    const profile = localStorage.getItem('user_profile');
    if (profile) setUserProfile(JSON.parse(profile));
  }, []);

  // FR-106: The Email Generation Engine
  useEffect(() => {
    if (!selectedJobForEmail) return;

    const job = selectedJobForEmail;
    const name = userProfile.name;
    
    let subject = "";
    let body = "";

    // Template Logic with Merge Variables
    if (emailTemplate === 'cold') {
      subject = `Application for ${job.title} role - ${name}`;
      body = `Dear Hiring Manager at ${job.company},\n\nI recently came across the ${job.title} opening and wanted to express my strong interest. With my background in Software Engineering, I believe I can contribute effectively to the ${job.company} engineering team.\n\nI have attached my resume for your review.\n\nBest regards,\n${name}`;
    } else if (emailTemplate === 'followup') {
      subject = `Following up on my application - ${job.title}`;
      body = `Hi Team,\n\nI applied for the ${job.title} position at ${job.company} last week and wanted to quickly follow up on the status of my application.\n\nI am very excited about the opportunity to join ${job.company}.\n\nThanks,\n${name}`;
    } else if (emailTemplate === 'thankyou') {
      subject = `Thank you for the interview - ${job.title}`;
      body = `Dear Team,\n\nThank you for taking the time to interview me for the ${job.title} role today. I really enjoyed learning more about ${job.company}'s vision.\n\nI look forward to hearing from you soon.\n\nSincerely,\n${name}`;
    }

    setGeneratedEmail(`SUBJECT: ${subject}\n\n${body}`);
  }, [emailTemplate, selectedJobForEmail, userProfile]);

  const handleDelete = (id: number) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    localStorage.setItem('my_jobs', JSON.stringify(updated));
  };

  const updateStatus = (id: number, newStatus: string) => {
    const updated = jobs.map(j => j.id === id ? { ...j, status: newStatus } : j);
    setJobs(updated);
    localStorage.setItem('my_jobs', JSON.stringify(updated));
  };

  const handleContextTransfer = (job: any, destination: string) => {
    localStorage.setItem('active_context_job', JSON.stringify({
      role: job.title,
      company: job.company,
      description: `Generating content for the role of ${job.title} at ${job.company}.`
    }));
    router.push(destination);
  };

  const openEmailModal = (job: any) => {
    setSelectedJobForEmail(job);
    setIsEmailModalOpen(true);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveManualJob = () => {
    if (!newJob.title || !newJob.company) return;
    const jobEntry = {
      id: Date.now(),
      title: newJob.title,
      company: newJob.company,
      status: "Saved",
      date: new Date().toISOString().split('T')[0]
    };
    const updatedJobs = [...jobs, jobEntry];
    setJobs(updatedJobs);
    localStorage.setItem('my_jobs', JSON.stringify(updatedJobs));
    setNewJob({ title: "", company: "" });
    setIsManualModalOpen(false);
  };

  const columns = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Application Tracker</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push('/feed')} className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition">
              Scan for Jobs
            </button>
            <button onClick={() => setIsManualModalOpen(true)} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold">
              <Plus size={18} /> Manual Add
            </button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
          {columns.map(col => (
            <div key={col} className="min-w-[320px] bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
              <h3 className={`font-bold mb-4 flex items-center justify-between ${
                col === 'Offer' ? 'text-green-400' : col === 'Rejected' ? 'text-red-400' : 'text-zinc-300'
              }`}>
                {col}
                <span className="bg-zinc-800 text-xs px-2 py-1 rounded-full text-zinc-500">
                  {jobs.filter(j => j.status === col).length}
                </span>
              </h3>

              <div className="space-y-3">
                {jobs.filter(j => j.status === col).map(job => (
                  <div key={job.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 group hover:border-zinc-700 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{job.title}</h4>
                      <div className="flex gap-2">
                        {/* FR-106: Email Button */}
                        <button onClick={() => openEmailModal(job)} className="text-zinc-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition" title="Generate Email">
                            <Mail size={16} />
                        </button>
                        <button onClick={() => handleDelete(job.id)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" title="Delete">
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">{job.company}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button onClick={() => handleContextTransfer(job, '/resume')} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold border border-purple-500/20 transition">
                        <FileText size={12} /> Resume
                      </button>
                      <button onClick={() => handleContextTransfer(job, '/readiness')} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-bold border border-green-500/20 transition">
                        <Target size={12} /> Prep
                      </button>
                    </div>

                    {col === 'Saved' && <button onClick={() => updateStatus(job.id, 'Applied')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition">Move to Applied →</button>}
                    {col === 'Applied' && <button onClick={() => updateStatus(job.id, 'Interview')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition">Move to Interview →</button>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANUAL ADD MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="text-blue-500" /> Add New Job
              </h2>
              <button onClick={() => setIsManualModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Job Title" className="w-full bg-black border border-zinc-800 rounded-lg p-3 outline-none focus:border-blue-500" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} />
              <input type="text" placeholder="Company Name" className="w-full bg-black border border-zinc-800 rounded-lg p-3 outline-none focus:border-blue-500" value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} />
              <button onClick={saveManualJob} disabled={!newJob.title || !newJob.company} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl mt-4">Add to Tracker</button>
            </div>
          </div>
        </div>
      )}

      {/* FR-106: EMAIL GENERATOR MODAL */}
      {isEmailModalOpen && selectedJobForEmail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail className="text-pink-500" /> Generate Email
              </h2>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex gap-2 mb-6">
               <button onClick={() => setEmailTemplate('cold')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${emailTemplate === 'cold' ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Cold Application</button>
               <button onClick={() => setEmailTemplate('followup')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${emailTemplate === 'followup' ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Follow Up</button>
               <button onClick={() => setEmailTemplate('thankyou')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${emailTemplate === 'thankyou' ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Thank You</button>
            </div>

            <div className="bg-black p-4 rounded-xl border border-zinc-800 mb-6 relative">
                <pre className="text-sm text-zinc-300 font-sans whitespace-pre-wrap">{generatedEmail}</pre>
                <button 
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
            </div>

            <p className="text-xs text-zinc-500">FR-106: Templates automatically merge Job Role ({selectedJobForEmail.title}) and Company ({selectedJobForEmail.company}).</p>
          </div>
        </div>
      )}

    </div>
  );
}