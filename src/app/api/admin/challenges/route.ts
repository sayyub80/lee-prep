import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const decoded = verifyToken(token);
    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    // Set activeDate to the start of the current day in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Overwrite if a challenge for today already exists, or create a new one
    const newChallenge = await DailyChallenge.findOneAndUpdate(
      { activeDate: today },
      {
        topic,
        createdBy: adminUser._id,
        activeDate: today,
        reward: 50,
        timeLimit: 60,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: newChallenge }, { status: 201 });
  } catch (error) {
    console.error("Create/Update Challenge Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}