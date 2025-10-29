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

  // if (request.nextUrl.pathname.startsWith("/legal")) return;
  // if (!authCookie && request.nextUrl.pathname !== '/') {
  //   return NextResponse.redirect(new URL('/', request.url))
  // }

  let data: any = null
  // if (authCookie) {
  //   const res = await fetch(`${process.env.PROD_URL}/api/session`, {
  //     headers: {
  //       Cookie: `${authCookie.name}=${authCookie.value}`,
  //     },

  //     next: { revalidate: 300 },
  //   })

  //   if (res) {
  //     data = await res.json()
  //   }
  // }

  // if (authCookie && request.nextUrl.pathname === '/') {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
