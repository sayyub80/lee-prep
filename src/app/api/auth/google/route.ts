import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const referralCode = searchParams.get('referralCode') || '';
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not defined');
  }
  const options = {
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
  };

  const qs = new URLSearchParams(options).toString();
  const redirectUrl = `${rootUrl}?${qs}`;

  // Set referralCode in a temporary cookie (expires in 10 minutes)
  const response = NextResponse.redirect(redirectUrl);
  if (referralCode) {
    response.cookies.set('google_referral_code', referralCode, {
      httpOnly: true,
      maxAge: 600,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return response;
}