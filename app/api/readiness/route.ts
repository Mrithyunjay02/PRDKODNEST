import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = "AIzaSyD3DKevUjgq_ogO2HHrLcJALwNR3KO13UE"; 

  try {
    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const instruction = `Analyze the JD and return JSON ONLY: { "aptitude": [], "technical": [], "hr": [] }`;

    const result = await model.generateContent(instruction + "\n\nJD:\n" + prompt);
    let text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json({ output: JSON.parse(text) });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to parse checklist" }, { status: 500 });
  }
}