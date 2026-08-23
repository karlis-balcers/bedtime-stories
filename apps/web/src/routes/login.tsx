import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Moon } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Parent",
          callbackURL: "/app",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/app",
        });
        if (err) throw new Error(err.message);
      }
      window.location.href = "/app";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5 py-10">
      <div className="w-full">
        <Link to="/" className="mb-10 flex items-center gap-2 text-ink">
          <Moon className="size-5" />
          <span className="font-display text-xl tracking-tight">Moonlit</span>
        </Link>
        <h1 className="font-display text-3xl font-medium tracking-tight">For parents</h1>
        <p className="mt-2 text-muted">Sign in to keep your child’s world, characters, and episodes.</p>

        {authEnabled ? (
          <div className="mt-8 space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/app" })}
              >
                Continue with {p.label}
              </Button>
            ))}
            <div className="flex items-center gap-3 py-2 text-xs uppercase tracking-[0.18em] text-subtle">
              <span className="h-px flex-1 bg-line" />
              or email
              <span className="h-px flex-1 bg-line" />
            </div>
            <form onSubmit={onEmail} className="space-y-3">
              {mode === "up" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                />
              </div>
              {error ? <p className="text-sm text-ember">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Please wait" : mode === "up" ? "Create account" : "Sign in"}
              </Button>
            </form>
            <button
              type="button"
              className="w-full pt-2 text-sm text-muted hover:text-ink"
              onClick={() => setMode(mode === "up" ? "in" : "up")}
            >
              {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
