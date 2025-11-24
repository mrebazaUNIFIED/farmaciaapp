import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: req.cookies }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const PUBLIC_PATHS = ['/signin', '/signup']

  if (!user && !PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  if (user && PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}