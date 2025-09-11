import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';


export async function POST(req: NextRequest) {
  
  const { text, history, user, personaPrompt } = await req.json(); // history: [{role: 'user'|'ai', content: string}]
  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }
   if (!personaPrompt) {
    return NextResponse.json({ error: 'No persona provided' }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // The system prompt now dynamically includes the selected persona's instructions
    const systemPrompt = {
      role: "model",
      parts: [{
        text: `
          ${personaPrompt}

          ---
          General Rules:
          - The user's name is ${user ? user.name : 'Guest'}. Their current English level is ${user ? user.level : 'beginner'}.
          - At the very beginning of the conversation, greet the user by their name. Afterwards, only use their name where it feels natural.
          - Do NOT use markdown like ** or * for formatting. Use numbered lists (1., 2.) if needed.
          - Keep your responses concise, natural, and encouraging.
          - If the user makes a grammar or vocabulary mistake, first give a natural reply to their message, and then on a new line, provide a gentle correction. For example:
            User: "I goed to the store yesterday."
            AI: "Oh, what did you buy at the store?
            
            By the way, a small correction: it's 'I went' instead of 'I goed'."
        `
      }]
    };

    // Build Gemini-style history with system prompt at the start
    const geminiHistory =
      history && Array.isArray(history)
        ? [systemPrompt, ...history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          }))]
        : [systemPrompt];

    // Create chat session with history using your preferred method
    const chat = ai.chats.create({
      model: 'gemini-1.5-flash',
      history: geminiHistory,
    });

    // Send user message
    const response = await chat.sendMessage({ message: text });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}