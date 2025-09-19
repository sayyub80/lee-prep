import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Group from '@/models/Group';
import ChallengeSubmission from '@/models/ChallengeSubmission';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  await dbConnect();
  try {
    // Admin verification
    // In a real app, you'd get the token and verify the user is an admin
    
    const [totalUsers, subscribedUsers, totalGroups, totalSubmissions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'subscription.plan': { $ne: 'free' } }),
      Group.countDocuments(),
      ChallengeSubmission.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      subscribedUsers,
      totalGroups,
      totalSubmissions,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}