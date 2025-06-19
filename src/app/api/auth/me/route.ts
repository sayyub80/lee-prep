import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import  dbConnect  from '@/lib/db';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const token = request.headers.get('cookie')?.split('; ')
      .find(c => c.startsWith('token='))?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}