import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  FileVideo,
  MessagesSquare,
  ListChecks,
  Search,
  Clock3,
  BrainCircuit,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
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
  const features = [
    {
      icon: FileVideo,
      title: "Video + audio upload",
      body: "Upload local recordings or paste a YouTube link. Loomly handles both with the same transcript and chat workflow.",
    },
    {
      icon: ListChecks,
      title: "Transcription + summary",
      body: "Turn raw audio into timestamped transcript, meeting summary, and structured takeaways automatically.",
    },
    {
      icon: Search,
      title: "Search by topic or phrase",
      body: "Search the transcript and jump directly to the exact moment in the video where the answer appears.",
    },
    {
      icon: Clock3,
      title: "Timeline-aware playback",
      body: "See highlighted timeline markers and skip straight to the relevant section in the video with a single click.",
    },
    {
      icon: BrainCircuit,
      title: "AI memory for the video",
      body: "The transcript is embedded into a vector store, so questions are answered from the actual media content.",
    },
    {
      icon: PlayCircle,
      title: "Play inside chat",
      body: "Watch the video directly in the dashboard without leaving the conversation, then ask follow-up questions.",
    },
    {
      icon: MessagesSquare,
      title: "Talk to the recording",
      body: "Ask for action items, key decisions, questions raised, next steps, and a quick recap from the exact content.",
    },
    {
      icon: ShieldCheck,
      title: "Grounded answers",
      body: "Responses are built from the transcript, helping the assistant stay relevant and anchored to your source material.",
    },
  ];

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
              AI video assistant for recordings, meetings, and YouTube links
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
              Turn any recording into a searchable conversation.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Upload a file or paste a YouTube video link. Loomly transcribes it, indexes the
              transcript into memory, shows you the key moments, and lets you ask questions about
              what was said — right inside the video context.
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

        <section className="grid gap-4 pb-8 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted/40"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-muted">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </section>

        <section className="py-16">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for real media work
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">Everything you need to understand a recording.</h2>
                <p className="mt-4 text-muted-foreground">
                  From a live call to a long YouTube video, Loomly turns the content into a chat-ready
                  knowledge base. You can search for a phrase, open the matching moment in the player,
                  and ask follow-up questions without rewatching the entire file.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <div className="font-medium text-foreground">Ask:</div>
                    <div className="mt-1">“What were the key decisions in this video?”</div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <div className="font-medium text-foreground">Search:</div>
                    <div className="mt-1">“budget approval” → jumps to the exact timestamp</div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <div className="font-medium text-foreground">Watch:</div>
                    <div className="mt-1">Open the matching video section and continue the conversation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
