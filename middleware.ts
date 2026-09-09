import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Helper to ensure any cookies modified/refreshed by Supabase Auth are preserved
 * on redirect responses across all mobile and desktop browsers.
 */
function createRedirectResponse(url: URL, baseResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  baseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mbljyfeoicpbptndgtcm.supabase.co";
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibGp5ZmVvaWNwYnB0bmRndGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTg0OTYsImV4cCI6MjEwMzEzNDQ5Nn0.RRMry_4R98GEZFJ0W4VUZF7buUlGSI30BrAmLtKa7OU";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Root Landing Page (/) & Public Auth Pages (/login, /register)
  // When a user has an active session, automatically redirect them to their respective dashboard
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (profile) {
        const role = profile.role?.toLowerCase();
        const status = profile.status?.toLowerCase();

        // Account status redirections
        if (status === "pending") {
          const url = request.nextUrl.clone();
          url.pathname = "/account-pending";
          return createRedirectResponse(url, supabaseResponse);
        }
        if (status === "rejected") {
          const url = request.nextUrl.clone();
          url.pathname = "/account-rejected";
          return createRedirectResponse(url, supabaseResponse);
        }
        if (status === "blocked") {
          const url = request.nextUrl.clone();
          url.pathname = "/account-blocked";
          return createRedirectResponse(url, supabaseResponse);
        }

        // Approved active user - send straight to their respective dashboard
        if (status === "approved") {
          const url = request.nextUrl.clone();
          if (role === "admin") {
            url.pathname = "/admin/dashboard";
            return createRedirectResponse(url, supabaseResponse);
          }
          if (role === "owner") {
            url.pathname = "/owner/dashboard";
            return createRedirectResponse(url, supabaseResponse);
          }
          if (role === "contractor") {
            url.pathname = "/contractor/dashboard";
            return createRedirectResponse(url, supabaseResponse);
          }
        }
      }
    }

    // No active user or logged out -> show normal landing/login/register page
    return supabaseResponse;
  }

  // 2. Protected route identification
  const isProtectedOwnerRoute = pathname.startsWith("/owner");
  const isProtectedContractorRoute = pathname.startsWith("/contractor");
  const isProtectedAdminRoute = pathname.startsWith("/admin");
  const isBidRoute = pathname.includes("/bid");

  if (!isProtectedOwnerRoute && !isProtectedContractorRoute && !isProtectedAdminRoute && !isBidRoute) {
    return supabaseResponse;
  }

  // Unauthenticated access to protected route -> redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return createRedirectResponse(url, supabaseResponse);
  }

  // Query profile for status and role verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile) {
    console.log(`[MIDDLEWARE DEBUG] PATH: ${pathname} | USER: ${user.id} | NO PROFILE FOUND -> /complete-profile`);
    const url = request.nextUrl.clone();
    url.pathname = "/complete-profile";
    return createRedirectResponse(url, supabaseResponse);
  }

  const role = profile.role?.toLowerCase();
  const status = profile.status?.toLowerCase();

  // Account status enforcement
  if (status === "pending" && !pathname.startsWith("/account-pending")) {
    const url = request.nextUrl.clone();
    url.pathname = "/account-pending";
    return createRedirectResponse(url, supabaseResponse);
  }

  if (status === "rejected" && !pathname.startsWith("/account-rejected")) {
    const url = request.nextUrl.clone();
    url.pathname = "/account-rejected";
    return createRedirectResponse(url, supabaseResponse);
  }

  if (status === "blocked" && !pathname.startsWith("/account-blocked")) {
    const url = request.nextUrl.clone();
    url.pathname = "/account-blocked";
    return createRedirectResponse(url, supabaseResponse);
  }

  if (status !== "approved") {
    // Non-approved accounts cannot proceed to protected dashboards
    return supabaseResponse;
  }

  // Role routing enforcement
  if (isProtectedAdminRoute && role !== "admin") {
    console.log(`[MIDDLEWARE DENIAL] Non-admin user (${role}) attempted admin route: ${pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = role === "owner" ? "/owner/dashboard" : role === "contractor" ? "/contractor/dashboard" : "/";
    return createRedirectResponse(url, supabaseResponse);
  }

  if (isProtectedOwnerRoute && role !== "owner") {
    console.log(`[MIDDLEWARE DENIAL] Non-owner user (${role}) attempted owner route: ${pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin/dashboard" : role === "contractor" ? "/contractor/dashboard" : "/";
    return createRedirectResponse(url, supabaseResponse);
  }

  if (isProtectedContractorRoute && role !== "contractor") {
    console.log(`[MIDDLEWARE DENIAL] Non-contractor user (${role}) attempted contractor route: ${pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin/dashboard" : role === "owner" ? "/owner/dashboard" : "/";
    return createRedirectResponse(url, supabaseResponse);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/owner/:path*",
    "/contractor/:path*",
    "/admin/:path*",
    "/tenders/:id/bid",
  ],
};
