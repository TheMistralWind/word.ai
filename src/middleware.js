import { NextResponse } from 'next/server';

export function middleware(request) {
    // If SITE_PASSWORD is not set, allow access (public)
    const sitePassword = process.env.SITE_PASSWORD;
    if (!sitePassword) return NextResponse.next();

    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        // Check password (username is ignored)
        if (pwd === sitePassword) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
