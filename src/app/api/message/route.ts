import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GroupMessage from '@/models/GroupMessage';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    
    const { groupId, text, senderName } = await req.json();

    if (!groupId || !text || !senderName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newMessage = new GroupMessage({
      group: groupId,
      sender: decoded.userId,
      senderName: senderName,
      text: text,
    });

    await newMessage.save();

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });

  } catch (error) {
    console.error("Save Message API Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}