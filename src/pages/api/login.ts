import type { APIRoute } from 'astro';
import { getEnv, checkCredentials, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  const env = getEnv(locals);
  const form = await request.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');

  if (!env.SESSION_SECRET) {
    return redirect('/dashboard/login?error=config');
  }
  if (!checkCredentials(env, username, password)) {
    return redirect('/dashboard/login?error=1');
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return redirect('/dashboard');
};
