import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api')) {
    const url = request.nextUrl.clone()
    url.host = 'localhost'
    url.port = '9000'
    url.protocol = 'http'
    return NextResponse.rewrite(url)
  }
  const authCookie = request.cookies.get('connect.sid')

  if (request.nextUrl.pathname.startsWith('/legal')) return
  if (request.nextUrl.pathname.startsWith('/privacy-policy')) return
  if (request.nextUrl.pathname.startsWith('/cookie-policy')) return
  if (request.nextUrl.pathname.startsWith('/terms')) return
  if (!authCookie && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null
  let isAuthenticated = false

  if (authCookie) {
    try {
      const res = await fetch(`${process.env.PROD_URL}/api/auth/session`, {
        headers: {
          Cookie: `${authCookie.name}=${authCookie.value}`,
        },
        next: { revalidate: 300 },
      })
      if (res.ok) {
        data = await res.json()
        if (data && data.code === 'SESSION_VALID') {
          isAuthenticated = true
        }
      }
      console.log('Session verification response:', res)
      console.log('Session verification response:', isAuthenticated)
    } catch (error) {
      console.log('Session verification failed:', error)
    }
  }

  if (isAuthenticated && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (
    !isAuthenticated &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/legal') &&
    !request.nextUrl.pathname.startsWith('/privacy-policy') &&
    !request.nextUrl.pathname.startsWith('/cookie-policy') &&
    !request.nextUrl.pathname.startsWith('/terms')
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
