import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../lib/firebase';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  console.log('Middleware: Processing request for', pathname);

  if (pathname === '/score_list' || pathname === '/blog') {
    const idToken = request.cookies.get('auth-token')?.value;
    console.log('Middleware: auth-token cookie', { idToken: idToken ? idToken.substring(0, 10) + '...' : null });

    if (!idToken) {
      console.log(`Middleware: No auth-token cookie for ${pathname}, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      console.log('Middleware: Token verified, UID:', uid);

      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        console.log('Middleware: User document not found for UID:', uid);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const username = userDoc.data()?.username;
      if (!username) {
        console.log('Middleware: Username not found in user document for UID:', uid);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const redirectPath = pathname === '/score_list' 
        ? `/score_list/${encodeURIComponent(username)}?idToken=${idToken}`
        : `/blog/${encodeURIComponent(username)}?idToken=${idToken}`;
      console.log(`Middleware: Redirecting ${pathname} to ${redirectPath}`);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch (error: any) {
      console.error(`Middleware auth error for ${pathname}:`, {
        message: error.message,
        code: error.code,
      });
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/score_list/') || pathname.startsWith('/blog/') || pathname.startsWith('/scores/') || pathname === '/settings' || pathname === '/admin') {
    const idToken = request.cookies.get('auth-token')?.value;
    console.log('Middleware: Checking auth-token cookie for', pathname, { idToken: idToken ? idToken.substring(0, 10) + '...' : null });

    if (!idToken) {
      console.log('Middleware: No auth-token cookie, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const auth = getAuth();
      await auth.verifyIdToken(idToken);
      console.log('Middleware: User authenticated, allowing access to', pathname);
      return NextResponse.next();
    } catch (error: any) {
      console.error('Middleware auth error:', {
        message: error.message,
        code: error.code,
        pathname,
      });
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log('Middleware: Allowing access to public route', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/score_list', '/blog', '/score_list/:path*', '/blog/:path*', '/scores/:path*', '/settings', '/admin'],
};