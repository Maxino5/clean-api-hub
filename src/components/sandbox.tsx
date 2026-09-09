import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { demoCapture, type CaptureResponse } from "@/lib/capture.functions";
import { CodeBlock } from "@/components/code-block";

const DEFAULT_RESPONSE: CaptureResponse = {
  status: "success",
  execution_time_ms: 342,
  data: {
    screenshot_url: "https://cdn.mysaas.com/shots/stripe_1280x720.png",
    metadata: {
      title: "Stripe | Financial Infrastructure for the Internet",
      description:
        "Stripe is a suite of APIs powering online payment processing and commerce solutions for internet businesses of all sizes.",
      canonical_url: "https://stripe.com/",
      og_image: "https://images.stripe.com/v3/open-graph.png",
      status_code: 200,
    },
  },
  credits_remaining: 99,
};

export function Sandbox() {
  const capture = useServerFn(demoCapture);
  const [url, setUrl] = useState("https://stripe.com");
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [fullPage, setFullPage] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CaptureResponse>(DEFAULT_RESPONSE);

  const requestBody = { url, format, width, height, fullPage };

  const requestSnippet = `curl -X POST https://api.mysaas.com/v1/capture \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_live_demo123456" \\
  -d '${JSON.stringify(requestBody)}'`;

  async function run() {
    setPending(true);
    setError(null);
    const started = Date.now();
    try {
      const result = await capture({ data: requestBody });
      setResponse(result);
      if (result.message) setError(result.message);
    } catch {
      setError("The sandbox request failed. Check the URL and try again.");
    } finally {
      const remaining = 300 - (Date.now() - started);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setPending(false);
    }
  }

  return (
    <div className="border border-border">
      <div className="flex flex-col gap-1 border-b border-border bg-surface px-4 py-3">
        <h2 className="text-sm font-medium">Live sandbox</h2>
        <p className="text-sm text-muted-foreground">
          Send a real request against POST /v1/capture. No account required.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="min-w-0 border-b border-border p-4 lg:border-b-0 lg:border-r">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted-foreground">
            url
          </label>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            spellCheck={false}
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] outline-none focus:border-primary"
            placeholder="https://stripe.com"
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                format
              </label>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as typeof format)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2 py-2 font-mono text-[13px] outline-none focus:border-primary"
              >
                <option value="png">png</option>
                <option value="jpeg">jpeg</option>
                <option value="webp">webp</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                width
              </label>
              <input
                type="number"
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2 py-2 font-mono text-[13px] outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                height
              </label>
              <input
                type="number"
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-2 py-2 font-mono text-[13px] outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 font-mono text-[13px]">
            <input
              type="checkbox"
              checked={fullPage}
              onChange={(event) => setFullPage(event.target.checked)}
              className="size-4 rounded-sm border border-border accent-primary"
            />
            fullPage
          </label>

          <button
            type="button"
            onClick={run}
            disabled={pending}
            className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Processing..." : "Send request"}
          </button>

          {error ? (
            <p className="mt-3 border border-border bg-surface px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="mt-4">
            <CodeBlock label="request" code={requestSnippet} />
          </div>
        </div>

        <div className="p-4 pb-5 min-w-0">
          <CodeBlock label="response" code={JSON.stringify(response, null, 2)} />
          <p className="mt-3 break-words text-sm text-muted-foreground">
            The sandbox returns live metadata for the URL you enter. Screenshot rendering is served
            from the CDN on authenticated requests.
          </p>
        </div>
      </div>
    </div>
  );
}
