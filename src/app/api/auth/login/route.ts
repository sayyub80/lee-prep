import { NextResponse } from 'next/server';
import User from '@/models/User';
import  dbConnect  from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({ userId: user._id.toString() });

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      referralCode: user.referralCode
    };
     // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: userData
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}