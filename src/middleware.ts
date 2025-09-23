// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/practice', '/courses', '/community', '/profile', '/admin'];
  const adminRoutes = ['/admin'];

  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;
      const userStatus = payload.status as string;

      if (userStatus === 'suspended') {
        const response = NextResponse.redirect(new URL('/login?error=suspended', request.url));
        response.cookies.delete('token');
        return response;
      }
      
      // --- NEW FIX: Redirect admins away from the user dashboard ---
      // If the user is an admin and tries to access the regular user dashboard,
      // send them to their own admin panel instead.
      if (userRole === 'admin' && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // This rule prevents regular users from accessing admin pages
      if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // This rule prevents logged-in users from accessing login/signup pages
      if (pathname === '/login' || pathname === '/sign-up') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (err) {
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