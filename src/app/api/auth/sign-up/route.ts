import { NextResponse } from 'next/server';
import User from '@/models/User';
import  dbConnect  from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { name, email, password, confirmPassword, referralCode } = await request.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const user = new User({ name, email, password });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        // This should be an atomic operation, but for simplicity:
        referrer.credits += 10;
        referrer.referrals.push(user._id);
        await referrer.save();
      }
    }

    await user.save();
    
    // --- FIX: Add user.status (which defaults to 'active') to the token payload ---
    const token = generateToken({ userId: user._id.toString(), role: user.role, status: user.status });

    const response = NextResponse.json({
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

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}