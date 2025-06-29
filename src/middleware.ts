import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function isTokenValid(token: string) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/practice', '/courses', '/community', '/profile'];

  // If the route is protected and token is missing or invalid, redirect to login (no ?from param)
  if (
    protectedRoutes.some(route => pathname.startsWith(route)) &&
    (!token || !(await isTokenValid(token)))
  ) {
    // Prevent infinite redirect loop
    if (pathname === '/login' || pathname === '/sign-up') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access /login or /sign-up, redirect to dashboard
  if (
    token &&
    (pathname === '/login' || pathname === '/sign-up') &&
    (await isTokenValid(token))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
       '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    ],
};