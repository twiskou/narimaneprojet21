import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "narp-smart-secret"
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('narp_token')?.value;
  const { pathname } = request.nextUrl;

  // Paths requiring auth
  const protectedPaths = [
    '/dashboard',
    '/api/missions',
    '/api/ai/analyze',
    '/api/dashboard',
  ];

  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let payload;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    payload = verified.payload;
  } catch (e) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = payload.role as string;

  // Role checks
  if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/api/dashboard/admin')) {
    if (role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/dashboard/analyst') || pathname.startsWith('/api/dashboard/analyst') || 
      pathname.startsWith('/dashboard/missions') || pathname.startsWith('/api/missions') || 
      pathname.startsWith('/api/ai/analyze')) {
    if (role !== 'ADMIN' && role !== 'ANALYST') {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
