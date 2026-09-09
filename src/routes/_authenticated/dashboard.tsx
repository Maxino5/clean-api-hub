import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAccount, createApiKey, revokeApiKey } from "@/lib/account.functions";
import { SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Capture API keys and usage" },
      {
        name: "description",
        content:
          "Generate, copy or revoke your Capture API key, track monthly request usage and change your plan.",
      },
      { property: "og:title", content: "Dashboard | Capture API keys and usage" },
      {
        property: "og:description",
        content: "Generate, copy or revoke your API key and track monthly request usage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  scale: "Scale",
};

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getAccount);
  const generateKey = useServerFn(createApiKey);
  const revokeKey = useServerFn(revokeApiKey);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount(),
  });

  async function onGenerate() {
    setPending(true);
    setError(null);
    try {
      await generateKey({ data: { label: "Default key" } });
      await queryClient.invalidateQueries({ queryKey: ["account"] });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create a key.");
    } finally {
      setPending(false);
    }
  }

  async function onRevoke(id: string) {
    setPending(true);
    setError(null);
    try {
      await revokeKey({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["account"] });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not revoke the key.");
    } finally {
      setPending(false);
    }
  }

  async function copy(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const used = data?.requests_used ?? 0;
  const limit = data?.limit ?? 100;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const activeKeys = (data?.keys ?? []).filter((key) => !key.revoked_at);
  const revokedKeys = (data?.keys ?? []).filter((key) => key.revoked_at);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="font-mono text-sm font-medium">capture.api</span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold">Developer dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Keys authenticate requests with the x-api-key header. Usage resets on the first day of
          each month.
        </p>

        {error ? (
          <p className="mt-4 border border-border bg-surface px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <section className="mt-8 border border-border">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <h2 className="text-sm font-medium">Monthly usage</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {PLAN_LABELS[data?.plan ?? "free"] ?? "Free"} plan
            </span>
          </div>
          <div className="p-4">
            <p className="font-mono text-sm">
              {used.toLocaleString()} / {limit.toLocaleString()} requests used
            </p>
            <div className="mt-3 h-3 w-full border border-border">
              <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {(limit - used).toLocaleString()} requests remaining in the current period
              {data?.period_start ? ` which started ${data.period_start}` : ""}.
            </p>
          </div>
        </section>

        <section className="mt-8 border border-border">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <h2 className="text-sm font-medium">API keys</h2>
            <button
              type="button"
              onClick={onGenerate}
              disabled={pending}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              Generate key
            </button>
          </div>

          <div className="divide-y divide-border">
            {isLoading ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Loading your keys.</p>
            ) : activeKeys.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No active key yet. Generate one to start calling the endpoint.
              </p>
            ) : (
              activeKeys.map((key) => {
                const shown = revealed[key.id]
                  ? key.key
                  : `${key.key.slice(0, 12)}${"\u2022".repeat(16)}`;
                return (
                  <div key={key.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <code className="flex-1 font-mono text-[13px]">{shown}</code>
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((current) => ({ ...current, [key.id]: !current[key.id] }))
                      }
                      className="rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:bg-surface"
                    >
                      {revealed[key.id] ? "Hide" : "Reveal"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(key.id, key.key)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:bg-surface"
                    >
                      {copiedId === key.id ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      {copiedId === key.id ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRevoke(key.id)}
                      disabled={pending}
                      className="rounded-md border border-border px-2.5 py-1 text-xs text-destructive transition-colors hover:bg-surface disabled:opacity-60"
                    >
                      Revoke
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {revokedKeys.length > 0 ? (
            <div className="border-t border-border px-4 py-3">
              <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Revoked
              </p>
              <ul className="mt-2 space-y-1">
                {revokedKeys.map((key) => (
                  <li key={key.id} className="font-mono text-[13px] text-muted-foreground">
                    {key.key.slice(0, 12)}
                    {"\u2022".repeat(16)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="mt-8 border border-border">
          <div className="border-b border-border bg-surface px-4 py-3">
            <h2 className="text-sm font-medium">Plan</h2>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <p className="max-w-xl text-sm text-muted-foreground">
              Pro raises the quota to 50,000 requests per month, Scale to 250,000 with a priority
              render queue. Billing is handled through Stripe Checkout.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/", hash: "pricing" })}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Manage subscription
            </button>
          </div>
        </section>

        <section className="mt-8 border border-border">
          <div className="border-b border-border bg-surface px-4 py-3">
            <h2 className="text-sm font-medium">First request</h2>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
            <code>{`curl -X POST https://api.mysaas.com/v1/capture \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeKeys[0]?.key ?? "sk_live_your_key"}" \\
  -d '{"url":"https://stripe.com","format":"png","width":1280,"height":720,"fullPage":false}'`}</code>
          </pre>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
