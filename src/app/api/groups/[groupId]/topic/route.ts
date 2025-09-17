// src/app/api/admin/groups/[groupId]/topic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  await dbConnect();
  const { groupId } = await context.params;

  try {
    // 1. Authenticate the admin
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get the new topic from the request
    const { title } = await req.json();
    if (!title) return NextResponse.json({ success: false, error: 'Topic title is required' }, { status: 400 });

    // 3. Update the group's current topic in the database
    await Group.updateOne(
      { _id: groupId },
      {
        $set: {
          currentTopic: {
            title: title,
            setBy: adminUser._id,
            setAt: new Date(),
          },
        },
      }
    );

    return NextResponse.json({ success: true, message: 'Topic updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
