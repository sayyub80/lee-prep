// src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // --- MODIFICATION START ---
    // Add the user's role to the token payload
    const tokenPayload = { userId: user._id.toString(), role: user.role };
    const token = generateToken(tokenPayload);
    // --- MODIFICATION END ---

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      referralCode: user.referralCode,
      role: user.role, // Also good to send the role to the frontend
    };

    const response = NextResponse.json({ success: true, token, user: userData });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}