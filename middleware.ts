import { auth } from '@/lib/auth';

export const middleware = auth((req) => {
  const protectedRoutes = ['/read', '/library'];

  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
      return Response.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export const runtime = 'nodejs';
