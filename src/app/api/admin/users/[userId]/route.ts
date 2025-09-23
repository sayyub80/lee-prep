import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
)  {
  await dbConnect();
  const { userId } = await context.params;
  try {
    const body = await req.json();
    // In a real app, add admin verification here

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: body }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}