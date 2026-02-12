import { ArrowUpRight, MapPin, DollarSign, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface JobProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  link: string;
}

export default function JobCard({ job }: { job: JobProps }) {
  // Create a pre-filled prompt for the AI
  const aiPrompt = `I am applying for the ${job.title} role at ${job.company}. Can you write a tailored resume for this?`;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{job.title}</h3>
          <p className="text-zinc-500 font-medium mt-1">{job.company}</p>
        </div>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
          {job.type}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {job.salary}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {job.postedAt}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        {/* NEW: The "Draft Resume" Button */}
        <Link 
          href={`/resume?prompt=${encodeURIComponent(aiPrompt)}`}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors"
        >
          <FileText className="w-4 h-4" /> Draft Resume
        </Link>

        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white hover:text-blue-600"
        >
          Apply Now <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}