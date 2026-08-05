import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_MARKER = "auth-token";

function isInvalidRefreshTokenError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /invalid refresh token|refresh token not found/i.test(message);
}

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes(AUTH_COOKIE_MARKER)) {
      request.cookies.delete(cookie.name);
      response.cookies.set(cookie.name, "", { expires: new Date(0), maxAge: 0, path: "/" });
    }
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return response;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let error: unknown = null;
  try {
    ({ error } = await supabase.auth.getClaims());
  } catch (authError) {
    error = authError;
  }

  if (error && isInvalidRefreshTokenError(error)) {
    clearAuthCookies(response, request);

    if (request.nextUrl.pathname.startsWith("/admin")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = `?error=session_expired&next=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
