import { NextRequest, NextResponse } from 'next/server'

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const url = request.nextUrl.clone()
    url.host = 'localhost'
    url.port = '9000'
    url.protocol = 'http'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
