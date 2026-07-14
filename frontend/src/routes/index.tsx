import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, FileVideo, MessagesSquare, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loomly — Chat with your videos" },
      {
        name: "description",
        content:
          "Upload any video or audio, get instant transcripts, summaries, and chat with the content.",
      },
      { property: "og:title", content: "Loomly — Chat with your videos" },
      {
        property: "og:description",
        content: "Turn any recording into a searchable, chattable knowledge base.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>Loomly</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              New — chat with any video
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
              Turn any recording into a conversation.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Upload a video or audio file. Loomly transcribes it, summarizes the important
              parts, and lets you ask questions like it's ChatGPT — but grounded in your
              content.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-24 md:grid-cols-3">
          {[
            {
              icon: FileVideo,
              title: "Upload video or audio",
              body: "Drag in a file up to 2GB. We handle mp4, mov, mp3, wav and more.",
            },
            {
              icon: ListChecks,
              title: "Instant transcript",
              body: "Timestamped, speaker-aware transcript ready in seconds.",
            },
            {
              icon: MessagesSquare,
              title: "Chat with it",
              body: "Ask questions, extract action items, summarize any section.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted/40"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-muted">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Loomly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
