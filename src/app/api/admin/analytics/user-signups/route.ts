import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } }
    ]);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching signup analytics:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}