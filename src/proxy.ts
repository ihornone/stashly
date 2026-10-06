import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/docs(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/share(.*)',
  '/api/share(.*)',
  '/api/telegram/webhook(.*)',
  // Public REST API — authenticates with its own bearer tokens (st__…),
  // not with Clerk sessions
  '/api/v1(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      // API callers get a machine-readable 401 instead of an HTML redirect
      if (req.nextUrl.pathname.startsWith('/api/') || req.nextUrl.pathname.startsWith('/content/')) {
        return NextResponse.json({ success: false, message: 'Потрібна авторизація' }, { status: 401 });
      }
      const signUpUrl = new URL('/sign-up', req.url);
      return NextResponse.redirect(signUpUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
