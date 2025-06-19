import { NextResponse } from 'next/server';
import User from '@/models/User';
import  dbConnect  from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { name, email, password, confirmPassword, referralCode } = await request.json();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create user
    const user = new User({ name, email, password });

    // Handle referral
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        referrer.credits += 10;
        await referrer.save();
      }
    }

    await user.save();


    // Generate token
    const token = generateToken({ userId: user._id.toString() });

    const response= NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        referralCode: user.referralCode
      }
    }, { status: 201 });
     // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

 return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}