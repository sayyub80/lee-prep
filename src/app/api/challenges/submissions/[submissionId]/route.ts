import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChallengeSubmission, { IChallengeSubmission } from '@/models/ChallengeSubmission';
import DailyChallenge from '@/models/DailyChallenge';
import { verifyToken } from '@/lib/jwt';

// This function must be named GET and must be exported
export async function GET(
  req: NextRequest, 
   context: { params: Promise<{ submissionId: string }> }
) {
  await dbConnect();
  const { submissionId } = await context.params;

  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const submission = await ChallengeSubmission.findById(submissionId)
      .populate('challenge', 'topic')
      .lean<IChallengeSubmission>();

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    if (submission.user.toString() !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: submission });

  } catch (error) {
    console.error("Fetch Submission Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}