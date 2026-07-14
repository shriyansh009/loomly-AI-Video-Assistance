import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getUsers, setSession } from "@/lib/auth";
import {login} from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in " }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    const data = await login(email, password);

    // Save JWT
    localStorage.setItem("token", data.access_token);

    // Save user information
    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success(`Welcome back, ${data.user.full_name}`);

    navigate({ to: "/dashboard" });

  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-foreground p-10 text-background md:flex">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-background text-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          Loomly
        </Link>
        <blockquote className="max-w-md space-y-3">
          <p className="text-2xl font-medium leading-snug">
            "Loomly cut my meeting review time by 80%. It's like ChatGPT for every call I
            record."
          </p>
          <footer className="text-sm text-background/70">
            — Priya M., Product Lead
          </footer>
        </blockquote>
        <div className="text-xs text-background/50">© {new Date().getFullYear()} Loomly</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in to continue to your dashboard.
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}