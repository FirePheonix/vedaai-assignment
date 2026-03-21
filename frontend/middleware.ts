import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"])
const isOnboarding = createRouteMatcher(["/onboarding(.*)"])

const teacherOnlyPaths = createRouteMatcher([
  "/create(.*)", "/analytics(.*)", "/assignments(.*)", "/paper(.*)",
  "/submissions(.*)", "/grade(.*)", "/library(.*)", "/toolkit(.*)",
])
const studentOnlyPaths = createRouteMatcher(["/student(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return

  const { sessionClaims } = await auth.protect()

  // Role is present only after configuring the Clerk JWT template:
  // Dashboard → Configure → Sessions → add: { "metadata": "{{user.public_metadata}}" }
  const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role ?? null

  // No role yet → send to onboarding (except if already there)
  if (!role && !isOnboarding(request)) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  // Students blocked from teacher-only paths
  if (role === "student" && teacherOnlyPaths(request)) {
    return NextResponse.redirect(new URL("/student/home", request.url))
  }

  // Teachers blocked from student paths
  if (role === "teacher" && studentOnlyPaths(request)) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // After onboarding, redirect to the right home
  if (isOnboarding(request) && role) {
    return NextResponse.redirect(
      new URL(role === "student" ? "/student/join" : "/home", request.url)
    )
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|ttf|woff2?|png|jpg|gif|svg|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
