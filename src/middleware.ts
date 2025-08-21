// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/practice', '/courses', '/community', '/profile', '/admin'];
  const adminRoutes = ['/admin'];

  // If trying to access a protected route without a token
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      // Decode the token to check the role
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;

      // If a non-admin tries to access an admin route, redirect them
      if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'admin') {
        // Redirect to a safe page like the dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // If a logged-in user tries to access login/signup, redirect to dashboard
      if (pathname === '/login' || pathname === '/sign-up') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (err) {
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
       '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    ],
};