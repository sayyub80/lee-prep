import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import GroupMessage from '@/models/GroupMessage';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  await dbConnect();
  const { groupId } = await context.params; // <-- await params!

  if (!groupId) {
    return NextResponse.json({ success: false, error: 'Group ID is missing' }, { status: 400 });
  }

  try {
    const group = await Group.findById(groupId).populate('members', 'name avatar').lean();
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const messages = await GroupMessage.find({ group: groupId }).sort({ createdAt: 1 }).limit(50).lean();

    return NextResponse.json({ success: true, data: { group, messages } });
  } catch (error) {
    console.error(`Error fetching group ${groupId}:`, error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}