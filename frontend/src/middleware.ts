import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ─── Maintenance-mode in-memory cache (30 s TTL) ─────────────────────────────
let maintenanceCache: { value: boolean; expiresAt: number } = {
  value: false,
  expiresAt: 0,
};

async function isMaintenanceOn(request: NextRequest): Promise<boolean> {
  if (Date.now() < maintenanceCache.expiresAt) return maintenanceCache.value;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );

    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();

    const active = data?.value === "true";
    maintenanceCache = { value: active, expiresAt: Date.now() + 30_000 };
    return active;
  } catch {
    return false;
  }
}

function isAllowedDuringMaintenance(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/maintenance") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health")
  );
}

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Under Maintenance — Resumelyzer</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.18) 0%, transparent 70%), #0f0f17;
      color: #fff;
    }
    .gear {
      width: 88px; height: 88px; margin-bottom: 2rem;
      animation: spin 8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .logo {
      font-size: 0.8rem; font-weight: 700; letter-spacing: 0.15em;
      text-transform: uppercase; color: #6366f1; margin-bottom: 1.25rem;
    }
    h1 {
      font-size: clamp(1.75rem, 5vw, 2.75rem); font-weight: 800;
      line-height: 1.2; margin-bottom: 1rem;
    }
    p {
      font-size: 1.05rem; color: #9ca3af; max-width: 480px;
      line-height: 1.7; margin-bottom: 2.5rem;
    }
    .pill {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.3);
      border-radius: 9999px; padding: 0.4rem 1rem;
      font-size: 0.82rem; color: #fb923c; font-weight: 600;
      margin-bottom: 2.5rem;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%; background: #fb923c;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .divider { width: 40px; height: 1px; background: #2d2d3d; margin-bottom: 2rem; }
    .footer { font-size: 0.78rem; color: #4b5563; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <svg class="gear" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 12a4 4 0 0 1 4 4v4.5a24 24 0 0 1 8.3 3.4l3.2-3.2a4 4 0 0 1 5.6 5.6l-3.2 3.2A24 24 0 0 1 69.5 38H74a4 4 0 0 1 0 8h-4.5a24 24 0 0 1-3.4 8.3l3.2 3.2a4 4 0 0 1-5.6 5.6l-3.2-3.2A24 24 0 0 1 52 62.5V67a4 4 0 0 1-8 0v-4.5a24 24 0 0 1-8.3-3.4l-3.2 3.2a4 4 0 0 1-5.6-5.6l3.2-3.2A24 24 0 0 1 26.5 46H22a4 4 0 0 1 0-8h4.5a24 24 0 0 1 3.4-8.3l-3.2-3.2a4 4 0 0 1 5.6-5.6l3.2 3.2A24 24 0 0 1 44 20.5V16a4 4 0 0 1 4-4z" fill="url(#g1)" opacity="0.9"/>
    <circle cx="48" cy="48" r="12" fill="#0f0f17"/>
    <circle cx="48" cy="48" r="8" fill="url(#g2)"/>
    <defs>
      <linearGradient id="g1" x1="22" y1="12" x2="74" y2="84" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>
      </linearGradient>
      <linearGradient id="g2" x1="40" y1="40" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>
      </linearGradient>
    </defs>
  </svg>

  <p class="logo">Resumelyzer</p>
  <h1>We'll be right back</h1>
  <p>We're performing scheduled maintenance to make Resumelyzer even better. This won't take long — please check back in a few minutes.</p>

  <div class="pill">
    <span class="dot"></span>
    Maintenance in progress
  </div>

  <div class="divider"></div>
  <p class="footer">Questions? Reach us at <a href="mailto:support@resumelyzer.com">support@resumelyzer.com</a></p>
</body>
</html>`;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh Supabase session first
  const response = await updateSession(request);

  // Check maintenance mode (skipped for admin/auth routes)
  if (!isAllowedDuringMaintenance(pathname)) {
    const maintenance = await isMaintenanceOn(request);
    if (maintenance) {
      // Return HTML directly — bypasses the Next.js layout entirely
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Retry-After": "120",
        },
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
