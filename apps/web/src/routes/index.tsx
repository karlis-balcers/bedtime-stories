import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { BookOpen, Moon, Radio, Waypoints } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="h-11 w-28 animate-pulse rounded-xl bg-ink/10" />;
  if (user) {
    return (
      <Button asChild>
        <Link to="/app">Open worlds</Link>
      </Button>
    );
  }
  return (
    <Button asChild>
      <Link to="/login">Begin</Link>
    </Button>
  );
}

function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <Moon className="size-5 text-moon" />
          <span className="font-display text-lg tracking-tight">Moonlit</span>
        </div>
        <nav className="flex items-center gap-3">
          <SignedOut>
            <Link to="/login" className="hidden text-sm text-muted hover:text-ink sm:inline">
              Sign in
            </Link>
          </SignedOut>
          <AuthSlot />
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pt-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-moon">Audio-first bedtime</p>
          <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(2.4rem,6vw,4.4rem)] font-medium tracking-tight">
            Stories that remember.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Moonlit owns your child’s universe. The narrator performs the next episode — characters, jokes, and unfinished mysteries stay.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AuthSlot />
            <Button asChild variant="outline">
              <a href="#how">How it works</a>
            </Button>
          </div>
        </div>
        <HeroCard />
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            icon={<Waypoints className="size-4" />}
            title="My World"
            body="A persistent universe of characters, places, possessions and running jokes. Episode 19 still knows who Max the chicken is."
          />
          <Feature
            icon={<Radio className="size-4" />}
            title="A director, then a voice"
            body="We plan the arc before anyone speaks. Then the same script becomes a book, a performance, and a quiet wind-down."
          />
          <Feature
            icon={<BookOpen className="size-4" />}
            title="Parents stay in the other room"
            body="Set length, mood, and what tonight is for. Afterward: a two-line recap. The child only hears the story."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-28">
        <h2 className="font-display text-3xl font-medium">Three ways to begin</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ModeCard title="One story" body="A self-contained night. Beginning, middle, sleepy end." />
          <ModeCard title="A finite series" body="A planned arc — eight chapters, a real climax, no improvised ending." />
          <ModeCard title="A living series" body="Every episode resolves. The world does not. Call it a world, not an infinite story." />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <article className="rounded-3xl bg-night-2 p-6 shadow-[var(--shadow-border)]">
      <div className="grid size-10 place-items-center rounded-xl bg-night-3 text-moon">{icon}</div>
      <h3 className="mt-5 text-xl font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

function ModeCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-3xl p-6 shadow-[var(--shadow-border)]">
      <h3 className="font-display text-2xl font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </article>
  );
}

function HeroCard() {
  return (
    <div className="relative rounded-[32px] bg-night-2 p-2 shadow-[var(--shadow-lift)]">
      <div className="overflow-hidden rounded-[24px] bg-night-3 px-6 py-8">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Ivars’ World — Episode 19</p>
        <p className="mt-4 font-display text-2xl leading-snug">
          Last time, Ivars escaped Caesar’s underground library, but Max the talking chicken accidentally took the mysterious golden key…
        </p>
        <div className="mt-8 flex items-center justify-between text-sm text-muted">
          <span>10 minutes</span>
          <span className="text-moon">Tonight</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <span className="block h-full w-2/3 rounded-full bg-moon" />
        </div>
      </div>
    </div>
  );
}
