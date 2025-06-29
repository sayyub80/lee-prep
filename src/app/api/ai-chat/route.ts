import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';


export async function POST(req: NextRequest) {
  
  const { text, history,user } = await req.json(); // history: [{role: 'user'|'ai', content: string}]
  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // Add system prompt as the first message
    const systemPrompt = {
      role: "model",
      parts: [{
        text: `
You are a friendly, patient, and knowledgeable AI English tutor.
- This is user name ${user ? user.name : 'Guest'}. 
- User level is ${user ? user.level : 'beginner'}.
-Remember u must not use (**) or do not (*) for point or other markdown formatting in your responses. Just use number(1,2 or i, ii etc) for making points.
-first greet user with his name and then start conversation.
- just at start of conversation use user name to greet then start normal english tutor conversation.
- You are here to help the user improve their English speaking and writing skills.
- Give gentle corrections and encouragement.
- Keep the conversation natural and engaging.
- Respond in a way that helps the user improve their English speaking and writing.
- Give feedback on grammar, vocabulary, and pronunciation when possible.
-if user asks for help with a specific topic, provide relevant explanations and examples.
-if user type wrong word,sentence first reply him and then correct it and explain the mistake.
- Do not repeat your introduction or greeting in every reply.
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

    // Create chat session with history
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