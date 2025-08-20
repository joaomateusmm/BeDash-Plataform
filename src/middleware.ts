import { NextRequest, NextResponse } from "next/server";

// Rotas que requerem plano pago
const premiumRoutes = [
  "/dashboard/analytics",
  "/patients/export",
  "/doctors/advanced",
  "/appointments/bulk",
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Verificar se é uma rota premium
  const isPremiumRoute = premiumRoutes.some((route) =>
    url.pathname.includes(route),
  );

  if (!isPremiumRoute) {
    return NextResponse.next();
  }

  // Para rotas premium, adicionar header para verificação no componente
  const response = NextResponse.next();
  response.headers.set("x-premium-check", "required");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
