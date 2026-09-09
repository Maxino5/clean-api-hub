import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-mono text-sm font-medium tracking-tight">
          capture.api
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/docs" className="text-muted-foreground transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link
            to="/"
            hash="pricing"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          {signedIn ? (
            <Link
              to="/dashboard"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono">capture.api</span>
        <span>Screenshots and page metadata over a single POST request.</span>
      </div>
    </footer>
  );
}
