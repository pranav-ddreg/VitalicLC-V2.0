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
  // Commented out authentication logic - can be enabled if needed

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
