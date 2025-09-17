import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt'; 

// Define an interface for the route's context parameters
interface IParams {
  params: {
    groupId: string;
  };
}

// Use the interface to type the function's second argument
export async function POST(
  req: NextRequest, 
  { params }: IParams
) {
  await dbConnect();
  const { groupId } = params;

  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // Add user to the group's member list
    await Group.updateOne(
        { _id: groupId },
        { $addToSet: { members: userId } }
    );
    
    // Add the group to the user's group list
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