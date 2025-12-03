import { NextResponse } from 'next/server';

export function middleware(request) {
    // If SITE_PASSWORD is not set, allow access (public)
    const sitePassword = process.env.SITE_PASSWORD;
    if (!sitePassword) return NextResponse.next();

    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
        try {
            const authValue = basicAuth.split(' ')[1];
            const decoded = atob(authValue);

            // Use indexOf to split only on the FIRST colon
            const splitIndex = decoded.indexOf(':');
            if (splitIndex !== -1) {
                const pwd = decoded.substring(splitIndex + 1);

                if (pwd === sitePassword) {
                    return NextResponse.next();
                }
            }
        } catch (e) {
            console.error("Auth parsing error", e);
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
