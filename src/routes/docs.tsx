import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { CodeBlock } from "@/components/code-block";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs | Capture API reference for POST /v1/capture" },
      {
        name: "description",
        content:
          "Request parameters, headers, response fields and error codes for the Capture API endpoint POST https://api.mysaas.com/v1/capture.",
      },
      { property: "og:title", content: "Docs | Capture API reference" },
      {
        property: "og:description",
        content:
          "Parameters, headers, response fields and error codes for POST /v1/capture, with copyable examples.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Docs,
});

const PARAMS = [
  ["url", "string", "required", "Absolute URL of the page to render. HTTP and HTTPS only."],
  ["format", "string", "png", "Image encoding of the screenshot: png, jpeg or webp."],
  ["width", "integer", "1280", "Viewport width in pixels, between 320 and 1920."],
  ["height", "integer", "720", "Viewport height in pixels, between 240 and 1920."],
  ["fullPage", "boolean", "false", "Capture the entire scrollable page instead of the viewport."],
];

const RESPONSE_FIELDS = [
  ["status", "success when the page rendered, error when it did not."],
  ["execution_time_ms", "Total render and extraction time on our side."],
  ["data.screenshot_url", "CDN URL of the stored image. Available for 30 days."],
  ["data.metadata.title", "og:title when present, otherwise the document title."],
  ["data.metadata.description", "Meta description, falling back to og:description."],
  ["data.metadata.canonical_url", "Canonical link, falling back to the final URL after redirects."],
  ["data.metadata.og_image", "og:image, falling back to twitter:image."],
  ["data.metadata.status_code", "HTTP status returned by the target page."],
  ["credits_remaining", "Requests left in the current billing period."],
];

const ERRORS = [
  ["401", "Missing or revoked x-api-key header."],
  ["402", "Monthly request quota reached. Upgrade the plan or wait for the period to reset."],
  ["422", "Invalid body: malformed URL, or width and height outside the allowed range."],
  ["504", "The target page did not respond within the eight second render budget."],
];

function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-semibold">API reference</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          One endpoint, one method. Authenticate with the key from your dashboard and send a JSON
          body. Responses are JSON with a fixed shape, so you can type them once.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Endpoint</h2>
          <div className="mt-3">
            <CodeBlock
              label="endpoint"
              code={`POST https://api.mysaas.com/v1/capture
Content-Type: application/json
x-api-key: sk_live_demo123456`}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Request body</h2>
          <table className="mt-3 w-full border border-border text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="border-b border-border px-3 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Field
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Type
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Default
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {PARAMS.map(([field, type, def, notes]) => (
                <tr key={field} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-mono text-[13px]">{field}</td>
                  <td className="px-3 py-2 font-mono text-[13px] text-muted-foreground">{type}</td>
                  <td className="px-3 py-2 font-mono text-[13px] text-muted-foreground">{def}</td>
                  <td className="px-3 py-2 text-muted-foreground">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Example</h2>
          <div className="mt-3 grid gap-4">
            <CodeBlock
              label="curl"
              code={`curl -X POST https://api.mysaas.com/v1/capture \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_live_demo123456" \\
  -d '{
    "url": "https://stripe.com",
    "format": "png",
    "width": 1280,
    "height": 720,
    "fullPage": false
  }'`}
            />
            <CodeBlock
              label="response"
              code={`{
  "status": "success",
  "execution_time_ms": 342,
  "data": {
    "screenshot_url": "https://cdn.mysaas.com/shots/stripe_1280x720.png",
    "metadata": {
      "title": "Stripe | Financial Infrastructure for the Internet",
      "description": "Stripe is a suite of APIs powering online payment processing and commerce solutions for internet businesses of all sizes.",
      "canonical_url": "https://stripe.com/",
      "og_image": "https://images.stripe.com/v3/open-graph.png",
      "status_code": 200
    }
  },
  "credits_remaining": 99
}`}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Response fields</h2>
          <dl className="mt-3 border border-border">
            {RESPONSE_FIELDS.map(([field, note]) => (
              <div
                key={field}
                className="grid gap-1 border-b border-border px-3 py-2 last:border-b-0 sm:grid-cols-[16rem_1fr]"
              >
                <dt className="font-mono text-[13px]">{field}</dt>
                <dd className="text-sm text-muted-foreground">{note}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Errors</h2>
          <dl className="mt-3 border border-border">
            {ERRORS.map(([code, note]) => (
              <div
                key={code}
                className="grid gap-1 border-b border-border px-3 py-2 last:border-b-0 sm:grid-cols-[6rem_1fr]"
              >
                <dt className="font-mono text-[13px]">{code}</dt>
                <dd className="text-sm text-muted-foreground">{note}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
