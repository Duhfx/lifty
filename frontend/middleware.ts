import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware simplificado - DashboardLayout já faz a proteção
export function middleware(request: NextRequest) {
    // Por enquanto, apenas deixa passar
    // A proteção está no DashboardLayout via useEffect
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
