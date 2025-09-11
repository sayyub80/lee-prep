// src/app/api/groups/[groupId]/join/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt'; 

// The context object containing params is the second argument.
// We define its type here to fix the build error.
export async function POST(req: NextRequest, context: { params: { groupId: string } }) {
  await dbConnect();
  // Destructure groupId from context.params
  const { groupId } = context.params;

  try {
    // 1. Authenticate the user from their browser cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // 2. Add the user to the group's member list and vice-versa
    // Using $addToSet prevents duplicates if the user is already a member
    await Group.updateOne(
        { _id: groupId },
        { $addToSet: { members: userId } }
    );
    
    await User.updateOne(
        { _id: userId },
        { $addToSet: { groups: groupId } }
    );

    return NextResponse.json({ success: true, message: 'Successfully joined group' });
  } catch (error) {
    console.error("Join Group Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}