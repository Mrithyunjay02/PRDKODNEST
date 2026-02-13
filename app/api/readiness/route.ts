import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // 1. 👇 Extract the 'userRole' sent from the frontend
    const { messages, userRole } = await req.json();
    
    // Safety fallback: If no role is found, default to "Software Engineer"
    const target = userRole || "Software Engineer";

    // 2. 👇 DYNAMIC SYSTEM PROMPT (This fixes the "Always Java" bug)
    const systemPrompt = `You are an expert technical interview coach specializing in ${target}.
    
    Your goal: Create a focused, 3-day interview preparation plan.
    
    CRITICAL INSTRUCTIONS:
    1. IGNORE generic advice. Focus ONLY on ${target}.
    2. If ${target} is "React Developer": Focus on Hooks, Redux, Virtual DOM.
    3. If ${target} is "Python Developer": Focus on Decorators, Flask/Django, Memory.
    4. If ${target} is "Java Developer": Focus on OOPs, Multithreading, Spring Boot.
    
    OUTPUT FORMAT:
    Return a valid JSON object with this exact structure (do not add markdown code blocks):
    {
      "day1": [ { "topics": "Topic Name", "time": "45 mins", "problems": "Specific Practice Question" } ],
      "day2": [ { "topics": "...", "time": "...", "problems": "..." } ],
      "day3": [ { "topics": "...", "time": "...", "problems": "..." } ]
    }`;

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    // 3. 👇 FIX FOR YOUR TYPESCRIPT ERROR
    // Your error log specifically asked for 'toTextStreamResponse', so we use that.
    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error('Readiness API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate plan' }), { 
      status: 500 
    });
  }
}