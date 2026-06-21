import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from '@/lib/auth';

// Public exceptions inside the protected areas.
const OPEN_PATHS = ['/dashboard/login', '/api/login'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProtected =
    (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) &&
    !OPEN_PATHS.some((p) => pathname === p || pathname === `${p}/`);

  if (!isProtected) return next();

  const authed = await isAuthenticated(context.locals, context.cookies);
  if (authed) return next();

  if (pathname.startsWith('/api')) {
    return new Response(JSON.stringify({ ok: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return context.redirect('/dashboard/login');
});
