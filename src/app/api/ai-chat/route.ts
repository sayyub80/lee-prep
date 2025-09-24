import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- ElevenLabs Constants ---
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; 
const ELEVENLABS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

// --- Gemini Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getAiTextResponse(text: string, history: any[], user: any, personaPrompt: string) {
    
    // --- FIX: Conditionally add the greeting instruction based on conversation length ---
    const greetingInstruction = (history.length <= 1) 
        ? "- At the very beginning of the conversation, greet the user by their name. Afterwards, only use their name where it feels natural."
        : "- Do not greet the user again. Continue the conversation naturally.";

    const systemInstruction = {
      role: "system",
      parts: [{
        text: `
          ${personaPrompt}

          ---
          General Rules:
          - The user's name is ${user ? user.name : 'Guest'}. Their current English level is ${user ? user.level : 'beginner'}.
          ${greetingInstruction} 
          - Do NOT use markdown like ** or * for formatting. Use numbered lists (1., 2.) if needed.
          - Keep your responses concise, natural, and encouraging.
          - If the user makes a grammar or vocabulary mistake, first give a natural reply to their message, and then on a new line, provide a gentle correction. For example:
            User: "I goed to the store yesterday."
            AI: "Oh, what did you buy at the store?
            
            By the way, a small correction: it's 'I went' instead of 'I goed'."
        `
      }]
    };
    
    const geminiHistory =
      history && Array.isArray(history)
        ? history.map((msg: { role: 'user' | 'ai'; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          }))
        : [];

    const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction,
    });
    
    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(text);
    return result.response.text();
}


export async function POST(req: NextRequest) {
  try {
    const { text, history, user, personaPrompt } = await req.json();
    if (!text || !personaPrompt) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const aiText = await getAiTextResponse(text, history, user, personaPrompt);

    if (!aiText) {
        throw new Error("AI failed to generate a text response.");
    }
    
    if (!ELEVENLABS_API_KEY) {
        return NextResponse.json({ text: aiText });
    }
    
    const textToSpeak = aiText.split("\n\nFeedback:")[0];

    const ttsResponse = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        'accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: textToSpeak,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!ttsResponse.ok || !ttsResponse.body) {
      console.error('ElevenLabs API Error:', await ttsResponse.text());
      return NextResponse.json({ text: aiText });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'audio/mpeg');
    responseHeaders.set('X-AI-Response-Text', encodeURIComponent(aiText));

    return new NextResponse(ttsResponse.body, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}