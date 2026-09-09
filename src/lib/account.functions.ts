import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  pro: 50_000,
  scale: 250_000,
};

export type ApiKeyRow = {
  id: string;
  label: string;
  key: string;
  revoked_at: string | null;
  created_at: string;
};

export type AccountSnapshot = {
  plan: string;
  limit: number;
  requests_used: number;
  period_start: string;
  keys: ApiKeyRow[];
};

function newKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `sk_live_${body}`;
}

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountSnapshot> => {
    const { supabase, userId } = context;

    const existing = await supabase
      .from("accounts")
      .select("plan, requests_used, period_start")
      .eq("user_id", userId)
      .maybeSingle();

    let account = existing.data;
    if (!account) {
      const created = await supabase
        .from("accounts")
        .insert({ user_id: userId })
        .select("plan, requests_used, period_start")
        .single();
      if (created.error) throw new Error(created.error.message);
      account = created.data;
    }

    const keys = await supabase
      .from("api_keys")
      .select("id, label, key, revoked_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (keys.error) throw new Error(keys.error.message);

    return {
      plan: account.plan,
      limit: PLAN_LIMITS[account.plan] ?? PLAN_LIMITS["free"]!,
      requests_used: account.requests_used,
      period_start: account.period_start,
      keys: keys.data ?? [],
    };
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ label: z.string().trim().min(1).max(60).default("Default key") }).parse(data ?? {}),
  )
  .handler(async ({ data, context }): Promise<ApiKeyRow> => {
    const { supabase, userId } = context;

    const active = await supabase
      .from("api_keys")
      .select("id")
      .eq("user_id", userId)
      .is("revoked_at", null);
    if (active.error) throw new Error(active.error.message);
    if ((active.data?.length ?? 0) >= 3) {
      throw new Error("You can hold at most three active keys. Revoke one first.");
    }

    const inserted = await supabase
      .from("api_keys")
      .insert({ user_id: userId, label: data.label, key: newKey() })
      .select("id, label, key, revoked_at, created_at")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    return inserted.data;
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const updated = await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (updated.error) throw new Error(updated.error.message);
    return { ok: true };
  });
