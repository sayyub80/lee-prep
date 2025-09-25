import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';

export async function GET(
   req: NextRequest,
  context: { params: Promise<{ challengeId: string }> }
) {
  await dbConnect();
  const { challengeId } = await context.params;

  if (!challengeId) {
    return NextResponse.json({ success: false, error: 'Challenge ID is missing' }, { status: 400 });
  }

  try {
    const challenge = await DailyChallenge.findById(challengeId).lean();
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: challenge });
  } catch (error) {
    console.error(`Error fetching challenge ${challengeId}:`, error);
    // Handle cases where the ID format is invalid
    if (error instanceof Error && error.name === 'CastError') {
        return NextResponse.json({ success: false, error: 'Invalid Challenge ID format' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}