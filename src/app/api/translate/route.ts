// src/app/api/translate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // --- NEW, SIMPLIFIED PROMPT ---
    // This is a more direct and reliable instruction for the AI.
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Provide only the translated text.\n\nText to translate: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
  }
}