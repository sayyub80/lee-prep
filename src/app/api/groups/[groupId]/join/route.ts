import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt'; 

interface Context {
  params: {
    groupId: string;
  };
}

export async function POST(
  req: NextRequest,
  context: Context
) {
  await dbConnect();
  const { groupId } = context.params;

  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    const userId = decoded.userId;

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