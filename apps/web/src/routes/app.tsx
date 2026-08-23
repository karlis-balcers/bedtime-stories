import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Moon } from "lucide-react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cinema = pathname.includes("/listen/") || pathname.includes("/read/");

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-ink/10" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-dvh">
      {cinema ? null : (
        <header className="sticky top-0 z-20 border-b border-line bg-night/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
            <Link to="/app" className="flex shrink-0 items-center gap-2">
              <Moon className="size-4 text-moon" />
              <span className="font-display text-base tracking-tight">Moonlit</span>
            </Link>
            <nav className="flex min-w-0 items-center gap-0.5 text-sm">
              <Link to="/app" className="rounded-xl px-2.5 py-2 text-muted hover:text-ink">
                Worlds
              </Link>
              <Link to="/app/new" className="rounded-xl px-2.5 py-2 text-muted hover:text-ink">
                Tonight
              </Link>
              <Link to="/app/parent" className="rounded-xl px-2.5 py-2 text-muted hover:text-ink">
                Parent
              </Link>
              <div className="ml-1 max-w-[42vw] overflow-hidden sm:max-w-none">
                <UserButton />
              </div>
            </nav>
          </div>
        </header>
      )}
      <Outlet />
    </div>
  );
}
