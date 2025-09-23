import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';

// --- UPDATE an existing group ---
export async function PUT(
   req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
)  {
  await dbConnect();
  const { groupId } = await context.params;
  try {
    // Admin verification
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || adminUser.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { name, description, topic } = body;
    
    const updatedGroup = await Group.findByIdAndUpdate(groupId, { name, description, topic }, { new: true });
    if (!updatedGroup) return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedGroup });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

// --- DELETE a group ---
export async function DELETE(
   req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
)  {
  await dbConnect();
  const { groupId } =await  context.params;
  try {
    // Admin verification
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || adminUser.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // Find and delete the group
    const deletedGroup = await Group.findByIdAndDelete(groupId);
    if (!deletedGroup) return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });

    // Remove the group from all users who were members
    await User.updateMany({ groups: groupId }, { $pull: { groups: groupId } });

    return NextResponse.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}