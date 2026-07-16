import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, MapPin, Phone, ArrowRight, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Loomly" },
      {
        name: "description",
        content:
          "Get in touch with the Loomly team for support, sales, or partnership inquiries.",
      },
      { property: "og:title", content: "Contact — Loomly" },
      {
        property: "og:description",
        content:
          "Get in touch with the Loomly team for support, sales, or partnership inquiries.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", message: "" });
    }, 3000);
  };

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
          <Link to="/">
            <Button variant="ghost" size="sm">
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              We reply within 24 hours
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Let's start a conversation.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have a question about Loomly, need help with an upload, or want
              to explore a partnership? Send us a message and we'll get back to
              you as soon as possible.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Email us</h3>
                  <p className="text-sm text-muted-foreground">
                    hello@loomly.example.com
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Call us</h3>
                  <p className="text-sm text-muted-foreground">
                    +1 (555) 000-1234
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Visit us</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Innovation Drive, San Francisco, CA 94107
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            {submitted ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Send className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Message sent!</h2>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Thanks for reaching out. We'll be in touch shortly.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    placeholder="How can we help?"
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2" size="lg">
                  Send message <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Loomly. All rights reserved.</span>
          <nav className="flex gap-4">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}