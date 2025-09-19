import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export async function GET(req: NextRequest) {
  try {
    const prompt = `
      Generate 3 diverse and engaging one-sentence speaking topics for an English learner's daily challenge.
      The topics should be suitable for a 1-minute speech.
      Format the response as a JSON array of strings. For example: ["Topic 1", "Topic 2", "Topic 3"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
     
    // Clean the text to ensure it's valid JSON
    const jsonString = text.replace(/```json|```/g, '').trim();
    const topics = JSON.parse(jsonString);

    return NextResponse.json({ success: true, suggestions: topics });
  } catch (error) {
    console.error('Error suggesting challenge topics:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate suggestions' }, { status: 500 });
  }
}