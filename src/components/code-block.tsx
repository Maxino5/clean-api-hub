import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  label,
  code,
  copyable = true,
}: {
  label: string;
  code: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="border border-border">
      <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {copyable ? (
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
