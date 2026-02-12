import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: API_KEY });

// --- CLEAN MOCK DATA (No Hashtags or Stars) ---
const MOCK_RESUME = `MRITHYUNJAY
FULL STACK DEVELOPER
Bangalore, India | student@pesitm.edu

PROFESSIONAL SUMMARY
Dedicated Computer Science Engineering student (2026 Batch) proficient in MERN stack and Next.js. Passionate about building scalable web apps.

TECHNICAL SKILLS
• Languages: Java, Python, JavaScript, TypeScript, SQL
• Frontend: React.js, Next.js, Tailwind CSS
• Backend: Node.js, Express.js, PostgreSQL
• Tools: Git, GitHub, Vercel

PROJECTS
Placement Readiness Platform
• Built a job ingestion pipeline with Next.js and Groq AI.
• Implemented ATS scoring and real-time resume generation.

E-Commerce Dashboard
• Developed a responsive admin panel for inventory management.`;

const MOCK_PREP = JSON.stringify({
  aptitude: ["Time and Work", "Data Interpretation", "Probability"],
  technical: ["Java OOPS", "React Hooks", "SQL Joins"],
  hr: ["Tell me about yourself", "Why this company?", "Strengths/Weaknesses"]
});

export async function POST(req: Request) {
  // 🔥 FIX: Defined outside try-catch so it is always available
  let type = "resume"; 

  try {
    const body = await req.json();
    const prompt = body.prompt || "";
    type = body.type || "resume";
    
    let systemInstruction = "";
    let jsonMode = false;

    if (type === "resume") {
      systemInstruction = "You are an expert ATS Resume Writer. Generate a professional resume in CLEAN PLAIN TEXT. Do NOT use markdown symbols like ** or #. Use UPPERCASE for headers and • for bullets.";
    } else if (type === "prep") {
      systemInstruction = "You are a Placement Coach. Create a 3-day study plan. Output STRICT JSON only. Format: { aptitude: [], technical: [], hr: [] }.";
      jsonMode = true;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile", // Using the working model
      temperature: 0.5,
      response_format: jsonMode ? { type: "json_object" } : { type: "text" }
    });

    const output = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ output });

  } catch (error) {
    console.error("Groq API Error:", error);
    
    // 🔥 FAIL-SAFE: Now 'type' is defined, so this line won't crash
    const fallback = (type === 'prep') ? MOCK_PREP : MOCK_RESUME;
    return NextResponse.json({ output: fallback });
  }
}