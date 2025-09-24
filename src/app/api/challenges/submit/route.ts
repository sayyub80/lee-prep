import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import DailyChallenge from '@/models/DailyChallenge';
import ChallengeSubmission from '@/models/ChallengeSubmission';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

async function transcribeAudio(audioFile: File): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    console.log("Whisper Transcription Successful:", transcription.text);
    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio with OpenAI:", error);
    return "";
  }
}

async function getAIFeedback(topic: string, transcript: string) {
    if (!transcript || transcript.trim() === '') {
        return {
            score: 0,
            feedback: {
                wellDone: "No speech was detected in your recording.",
                improvementArea: "Make sure to speak clearly for the entire duration. Try the challenge again!"
            }
        };
    }
    const prompt = `
      You are an expert English fluency coach. A user was given the speaking topic: "${topic}".
      Their transcribed response is: "${transcript}".
      Analyze the transcript and provide a score out of 100.
      Also, provide one sentence for "What you did well" and one sentence for "An area for improvement".
      Return your response ONLY as a valid JSON object:
      { "score": number, "feedback": { "wellDone": "string", "improvementArea": "string" } }
    `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini feedback error:", error);
        return { score: 75, feedback: { wellDone: "You expressed your ideas clearly.", improvementArea: "There was an issue analyzing the text." } };
    }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;
    const challengeId = formData.get('challengeId') as string | null;
    const topic = formData.get('topic') as string | null;

    if (!audio || (!challengeId && !topic)) {
      return NextResponse.json({ success: false, error: 'Missing audio, challengeId, or topic' }, { status: 400 });
    }
    
    let challengeTopic = topic;
    let submissionData: any = { user: userId };
    
    const transcript = await transcribeAudio(audio);
    const audioUrl = `/uploads/placeholder.webm`; 

    if (challengeId) {
        const challenge = await DailyChallenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
        }
        challengeTopic = challenge.topic;
        submissionData.challenge = challengeId;
        
        // Correctly get feedback before checking the score
        const { score, feedback } = await getAIFeedback(challengeTopic ?? "", transcript);
        
        if (challenge.reward > 0 && score > 0) {
             await User.updateOne({ _id: userId }, { $inc: { credits: challenge.reward } });
        }
        submissionData = { ...submissionData, score, feedback };

    } else if (challengeTopic) {
        const { score, feedback } = await getAIFeedback(challengeTopic ?? "", transcript);
        submissionData = { ...submissionData, score, feedback };
    } else {
       return NextResponse.json({ success: false, error: 'Topic could not be determined' }, { status: 400 });
    }

    const newSubmission = new ChallengeSubmission({
        ...submissionData,
        topic: challengeTopic,
        audioUrl,
        transcript,
    });
    await newSubmission.save();
    
    return NextResponse.json({ success: true, submissionId: newSubmission._id });

  } catch (error) {
    console.error("Challenge Submission Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}