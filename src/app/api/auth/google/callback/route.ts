import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const cookieStore = await cookies();
  const referralCode = cookieStore.get('google_referral_code')?.value;

  if (!code) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/login?error=google_oauth_failed`);
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/login?error=google_oauth_failed`);
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await userRes.json();

  await dbConnect();
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    const userName = profile.name || profile.email.split('@')[0];
    let referrerId = null;

    // Create a user instance
    user = new User({
      name: userName,
      email: profile.email,
      avatar: profile.picture,
      password: Math.random().toString(36),
    });

    // Check for a valid referrer before saving
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        referrerId = referrer._id;
      }
    }

    // Save the new user to get their _id
    await user.save();

    // If a referrer was found, update their record
    if (referrerId) {
      await User.updateOne(
        { _id: referrerId },
        {
          $inc: { credits: 10 },
          $push: { referrals: user._id }
        }
      );
    }
  }

  const token = generateToken({ userId: user._id, role: user.role });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(`${baseUrl}/dashboard`);
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('google_referral_code', '', { maxAge: 0, path: '/' });

  return response;
}