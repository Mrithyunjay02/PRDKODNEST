import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Get the last user message (the job description)
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // System prompt for resume generation
    const systemPrompt = `You are an expert resume writer and career coach. Your task is to generate a professional, tailored resume based on a job description provided by the user.

Guidelines:
1. Create a well-structured resume in plain text format
2. Include relevant sections: Header (Name, Contact Info), Professional Summary, Skills, Work Experience, Education
3. Tailor the resume to match the job requirements mentioned in the job description
4. Use professional language and action verbs
5. Format it cleanly with clear section headers
6. Make it ATS-friendly (no fancy formatting, use standard section names)
7. If specific details aren't provided, use placeholder text like "[Your Name]", "[Your Email]", etc.
8. Focus on achievements and quantifiable results where possible

Generate a complete, professional resume now:`;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Job Description:\n\n${lastMessage}\n\nPlease generate a tailored resume for this position.`,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate resume. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
