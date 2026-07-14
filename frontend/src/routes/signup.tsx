import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signup } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Loomly" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setLoading(true);

  try {
    const data = await signup(full_name, email, password);

    // Store JWT
    localStorage.setItem("token", data.access_token);

    // Store user info
    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success("Account created successfully!");

    navigate({ to: "/dashboard" });

  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start turning recordings into conversations.
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={full_name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-between bg-foreground p-10 text-background md:flex">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-background text-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          Loomly
        </Link>
        <div className="max-w-md space-y-4">
          <p className="text-2xl font-medium leading-snug">
            Everything you need to make sense of long-form video.
          </p>
          <ul className="space-y-2 text-sm text-background/70">
            <li>• Timestamped transcripts</li>
            <li>• Auto-generated summaries and titles</li>
            <li>• Ask questions grounded in your content</li>
          </ul>
        </div>
        <div className="text-xs text-background/50">© {new Date().getFullYear()} Loomly</div>
      </div>
    </div>
  );
}
