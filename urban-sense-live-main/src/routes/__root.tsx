import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportCoreError } from "../lib/core-error-reporting";
import { AppSidebar, MobileNav } from "../components/AppSidebar";
import { TopHeader } from "../components/TopHeader";
import { EventDrawer, ZoneDrawer } from "../components/Drawers";
import { StoreProvider } from "../lib/store";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportCoreError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Urban Eye — City Mobility Intelligence" },
      {
        name: "description",
        content:
          "AI-powered urban mobility intelligence and road safety control centre built on bus-mounted cameras and zone-based spatial mapping.",
      },
      { name: "author", content: "Urban Eye" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();
  const isLogin = location.pathname.startsWith('/login');

  // Route guarding migrated to native beforeLoad hook in index.tsx and live.tsx

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <LiquidGlassStyles />
        {isLogin ? (
          <Outlet />
        ) : (
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopHeader />
              <MobileNav />
              <main className="flex-1 p-4 lg:p-6">
                <Outlet />
              </main>
            </div>
          </div>
        )}
        <Toaster position="bottom-right" />
      </StoreProvider>
    </QueryClientProvider>
  );
}

/** Raw CSS injected at runtime — Tailwind cannot strip this. */
function LiquidGlassStyles() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      /* ═══ iOS LIQUID GLASS — DARK MODE ═══ */

      /* Vivid color mesh background */
      .dark body,
      html.dark body {
        background-color: #08080f !important;
        background-image:
          radial-gradient(ellipse 700px 500px at 8% 15%, rgba(59, 130, 246, 0.22), transparent),
          radial-gradient(ellipse 600px 400px at 82% 8%, rgba(168, 85, 247, 0.18), transparent),
          radial-gradient(ellipse 550px 400px at 45% 85%, rgba(52, 211, 153, 0.15), transparent),
          radial-gradient(ellipse 400px 350px at 90% 70%, rgba(251, 191, 36, 0.12), transparent) !important;
        background-attachment: fixed !important;
      }

      /* Frosted glass panels */
      .dark .panel,
      html.dark .panel {
        background: rgba(255, 255, 255, 0.04) !important;
        -webkit-backdrop-filter: blur(60px) saturate(180%) brightness(110%) !important;
        backdrop-filter: blur(60px) saturate(180%) brightness(110%) !important;
        border: 1px solid rgba(255, 255, 255, 0.10) !important;
        border-top-color: rgba(255, 255, 255, 0.20) !important;
        box-shadow:
          0 0 0 0.5px rgba(255, 255, 255, 0.08),
          0 8px 32px -4px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.12) !important;
      }

      /* Glass sidebar */
      .dark aside,
      html.dark aside {
        background: rgba(255, 255, 255, 0.025) !important;
        -webkit-backdrop-filter: blur(60px) saturate(170%) !important;
        backdrop-filter: blur(60px) saturate(170%) !important;
        border-right-color: rgba(255, 255, 255, 0.06) !important;
      }

      /* Glass top header */
      .dark header,
      html.dark header {
        background: rgba(8, 8, 15, 0.4) !important;
        -webkit-backdrop-filter: blur(60px) saturate(170%) !important;
        backdrop-filter: blur(60px) saturate(170%) !important;
        border-bottom-color: rgba(255, 255, 255, 0.06) !important;
      }

      /* Glass nav active */
      .dark .nav-active,
      html.dark .nav-active {
        background: linear-gradient(90deg, rgba(94, 158, 255, 0.14) 0%, rgba(94, 158, 255, 0.03) 100%) !important;
        border: 1px solid rgba(94, 158, 255, 0.15) !important;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.10),
          0 2px 12px -4px rgba(94, 158, 255, 0.25) !important;
      }
    `}} />
  );
}

