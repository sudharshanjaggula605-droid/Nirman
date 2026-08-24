import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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

  // Public & auth routes bypass
  const isProtectedOwnerRoute = pathname.startsWith("/owner");
  const isProtectedContractorRoute = pathname.startsWith("/contractor");
  const isProtectedAdminRoute = pathname.startsWith("/admin");
  const isBidRoute = pathname.includes("/bid");

  if (!isProtectedOwnerRoute && !isProtectedContractorRoute && !isProtectedAdminRoute && !isBidRoute) {
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Query profile for status and role verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return supabaseResponse;
  }

  // Account status enforcement
  if (profile.status === "pending" && !pathname.includes("approval-waiting")) {
    const url = request.nextUrl.clone();
    url.pathname = "/approval-waiting";
    return NextResponse.redirect(url);
  }

  if (profile.status === "rejected" && !pathname.includes("rejected")) {
    const url = request.nextUrl.clone();
    url.pathname = "/rejected";
    return NextResponse.redirect(url);
  }

  if (profile.status === "blocked" && !pathname.includes("blocked")) {
    const url = request.nextUrl.clone();
    url.pathname = "/blocked";
    return NextResponse.redirect(url);
  }

  // Role routing enforcement
  if (isProtectedAdminRoute && profile.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isProtectedOwnerRoute && profile.role !== "owner") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isProtectedContractorRoute && profile.role !== "contractor") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/owner/:path*",
    "/contractor/:path*",
    "/admin/:path*",
    "/tenders/:id/bid",
  ],
};
