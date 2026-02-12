import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio'; // The scraping library

// Fallback data in case the real scrape gets blocked
const FALLBACK_JOBS = [
  {
    id: 1,
    title: "Frontend Engineer (Next.js)",
    company: "Vercel",
    location: "Remote",
    salary: "$120k - $160k",
    type: "Full-time",
    postedAt: "Just now",
    link: "https://vercel.com/careers",
  },
  {
    id: 2,
    title: "AI Solutions Architect",
    company: "OpenAI",
    location: "San Francisco, CA",
    salary: "$200k - $350k",
    type: "Contract",
    postedAt: "2 hours ago",
    link: "https://openai.com/careers",
  },
];

export async function GET() {
  try {
    // 1. Target a real job board (WeWorkRemotely is easier to scrape for demos)
    const response = await fetch('https://weworkremotely.com/categories/remote-programming-jobs', {
      next: { revalidate: 3600 } // Cache results for 1 hour
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const scrapedJobs: any[] = [];

    // 2. Parse the HTML (This specific logic matches WeWorkRemotely's structure)
    $('section.jobs article li').each((index, element) => {
      // Limit to 5 jobs for speed
      if (index > 5) return;

      const title = $(element).find('.title').text().trim();
      const company = $(element).find('.company').text().trim();
      const region = $(element).find('.region').text().trim();
      const relativeLink = $(element).find('a').attr('href');
      
      // Only add if we found valid data
      if (title && company) {
        scrapedJobs.push({
          id: index + 100, // ID to avoid conflict
          title: title,
          company: company,
          location: region || "Remote",
          salary: "Competitive", // Most sites hide salary, so we default
          type: "Full-time",
          postedAt: "Today",
          link: `https://weworkremotely.com${relativeLink}`
        });
      }
    });

    // 3. If scraping worked, return mixed data (Real + Featured)
    if (scrapedJobs.length > 0) {
      return NextResponse.json([...scrapedJobs, ...FALLBACK_JOBS]);
    } 
    
    // If no jobs found, return fallback
    return NextResponse.json(FALLBACK_JOBS);

  } catch (error) {
    console.error("Scraping failed, using fallback:", error);
    return NextResponse.json(FALLBACK_JOBS);
  }
}