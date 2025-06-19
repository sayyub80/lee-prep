import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define routes
  const publicRoutes = ['/login', '/signup', '/terms', '/privacy'];
  const protectedRoutes = ['/dashboard', '/practice', '/courses', '/community', '/profile'];

  // 1. If user is NOT logged in and tries to access a protected route, redirect to login
  if (
    !token &&
    protectedRoutes.some(route => pathname.startsWith(route))
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If user IS logged in and tries to access /login or /signup, redirect to dashboard
  if (
    token &&
    (pathname === '/login' || pathname === '/signup')
  ) {
    // Optionally, verify token here if you want
    // const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), { headers: { 'Cookie': `token=${token}` } });
    // if (!verifyResponse.ok) { /* handle invalid token */ }

    // Prevent redirect loop: only redirect if not already on dashboard
    if (String(pathname) !== '/dashboard') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Otherwise, allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - api/auth (auth API routes)
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};