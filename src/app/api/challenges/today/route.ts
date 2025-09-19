import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const challenge = await DailyChallenge.findOne({ activeDate: today }).lean();

    if (!challenge) {
      return NextResponse.json({ success: false, error: 'No challenge found for today' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: challenge });
  } catch (error) {
    console.error("Fetch Today's Challenge Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}