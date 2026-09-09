import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or register | Capture API" },
      {
        name: "description",
        content:
          "Create a Capture API account to generate an API key, track monthly request usage and manage your plan.",
      },
      { property: "og:title", content: "Log in or register | Capture API" },
      {
        property: "og:description",
        content: "Create an account to generate an API key and track monthly request usage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setPending(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate({ to: "/dashboard", replace: true });
      return;
    }

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setPending(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setNotice("Check your inbox and confirm your email address to finish creating the account.");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPending(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Password reset link sent. It is valid for one hour.");
  }

  async function google() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    // On success the browser is redirected to Google, so this line only
    // runs when the request itself failed (e.g. provider not configured).
    if (oauthError) {
      setError("Google sign in failed. Try again or use your email address.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">
          {mode === "signup"
            ? "Create an account"
            : mode === "forgot"
              ? "Reset your password"
              : "Log in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "The free plan includes 100 requests per month and one API key."
            : mode === "forgot"
              ? "We will email you a link to choose a new password."
              : "Access your API key and current usage."}
        </p>

        <form onSubmit={submit} className="mt-6 border border-border p-5">
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />

          {mode !== "forgot" ? (
            <>
              <label className="mt-4 block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {pending
              ? "Working"
              : mode === "signup"
                ? "Create account"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Log in"}
          </button>

          {mode !== "forgot" ? (
            <>
              <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                onClick={google}
                className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface"
              >
                Continue with Google
              </button>
            </>
          ) : null}

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="mt-4 text-sm text-muted-foreground">{notice}</p> : null}
        </form>

        <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
          {mode !== "signup" ? (
            <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("signup")}>
              Need an account? Register
            </button>
          ) : null}
          {mode !== "signin" ? (
            <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("signin")}>
              Already registered? Log in
            </button>
          ) : null}
          {mode !== "forgot" ? (
            <button type="button" className="text-left hover:text-foreground" onClick={() => setMode("forgot")}>
              Forgot your password?
            </button>
          ) : null}
          <Link to="/docs" className="hover:text-foreground">
            Read the API reference
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
