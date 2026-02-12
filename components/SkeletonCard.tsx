export default function SkeletonCard() {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl animate-pulse">
        <div className="flex justify-between items-start">
          <div className="w-full">
            {/* Title Placeholder */}
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
            {/* Company Placeholder */}
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
          </div>
          {/* Badge Placeholder */}
          <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
  
        <div className="mt-6 flex flex-wrap gap-4">
          {/* Icons/Details Placeholders */}
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
  
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          {/* Footer Placeholders */}
          <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }