import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import  dbConnect  from '@/lib/db';

export async function GET(request: Request) {
  await dbConnect();

  const token = request.headers.get('cookie')?.split('; ')
    .find(c => c.startsWith('token='))?.split('=')[1];

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true, user: {
      id: user._id,
      name: user.name,
      email: user.email
    }});
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}