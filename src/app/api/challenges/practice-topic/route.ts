import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export async function GET(req: NextRequest) {
  try {
    const prompt = `
      Generate one engaging and creative one-sentence speaking topic for an English learner.
      The topic should be suitable for a 1-minute speech.
      Provide only the topic text itself, without any quotation marks or extra formatting.
      For example: Describe a color without using its name.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const topic = response.text().trim();

    return NextResponse.json({ success: true, topic: topic });
  } catch (error) {
    console.error('Error generating practice topic:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate topic' }, { status: 500 });
  }
}