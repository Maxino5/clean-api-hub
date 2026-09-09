import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | Capture API" },
      {
        name: "description",
        content: "Choose a new password for your Capture API developer account.",
      },
      { property: "og:title", content: "Set a new password | Capture API" },
      {
        property: "og:description",
        content: "Choose a new password for your Capture API developer account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Password updated. Redirecting to your dashboard.");
    setTimeout(() => navigate({ to: "/dashboard" }), 800);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open this page from the reset link in your email, then choose a new password.
        </p>
        <form onSubmit={submit} className="mt-6 border border-border p-5">
          <label className="block text-sm font-medium" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Saving" : "Update password"}
          </button>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
