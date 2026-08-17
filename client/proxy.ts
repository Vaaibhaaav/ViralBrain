import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define exactly which routes can bypass Clerk's authentication shield
const isPublicRoute = createRouteMatcher([
  "/api/webhook/clerk-webhook(.*)", 
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|_next/webpack-data|__next_route_context__).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};