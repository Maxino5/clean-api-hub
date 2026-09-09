import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Sandbox } from "@/components/sandbox";
import { CodeBlock } from "@/components/code-block";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Capture API | Screenshots and page metadata in one request" },
      {
        name: "description",
        content:
          "POST a URL and get back a high resolution screenshot plus title, description, canonical URL and social tags as structured JSON. Renders in under a second.",
      },
      {
        property: "og:title",
        content: "Capture API | Screenshots and page metadata in one request",
      },
      {
        property: "og:description",
        content:
          "One endpoint that renders any page headlessly and returns the screenshot URL with extracted SEO metadata as JSON.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "per month",
    quota: "100 requests per month",
    features: [
      "1280x720 screenshots",
      "Full metadata extraction",
      "1 API key",
      "Community support",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "per month",
    quota: "50,000 requests per month",
    features: [
      "Screenshots up to 1920px wide",
      "Full page capture",
      "3 API keys",
      "Email support within one business day",
    ],
    cta: "Choose Pro",
  },
  {
    name: "Scale",
    price: "$99",
    cadence: "per month",
    quota: "250,000 requests per month",
    features: [
      "Priority render queue",
      "Custom viewport and device pixel ratio",
      "3 API keys with usage split",
      "Uptime commitment of 99.9 percent",
    ],
    cta: "Choose Scale",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              POST https://api.mysaas.com/v1/capture
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Screenshots and page metadata from a single API call
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Rendering a page headlessly means running Chromium, managing timeouts, fonts and
              memory, then scraping the markup for title, description and social tags. Send us the
              URL instead. You get a high resolution screenshot and structured metadata back in
              about 340 milliseconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get an API key
              </Link>
              <Link
                to="/docs"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
              >
                Read the docs
              </Link>
            </div>

            <div className="mt-12 grid min-w-0 gap-6 lg:grid-cols-2">
              <div className="min-w-0">
                <CodeBlock
                  label="request"
                  code={`POST /v1/capture HTTP/1.1
Host: api.mysaas.com
Content-Type: application/json
x-api-key: sk_live_demo123456

{
  "url": "https://stripe.com",
  "format": "png",
  "width": 1280,
  "height": 720,
  "fullPage": false
}`}
                />
              </div>
              <div className="min-w-0">
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
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <Sandbox />
          </div>
        </section>

        <section id="pricing" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-semibold">Pricing</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every plan uses the same endpoint and the same response shape. Unused requests do not
              roll over. Cancel at any time.
            </p>

            <div className="mt-8 grid border border-border md:grid-cols-3">
              {TIERS.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`p-6 ${index > 0 ? "border-t border-border md:border-l md:border-t-0" : ""}`}
                >
                  <h3 className="text-sm font-medium">{tier.name}</h3>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.cadence}</span>
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{tier.quota}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-muted-foreground">
                        <span aria-hidden="true" className="text-foreground">
                          &#10003;
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/auth"
                    className="mt-6 block rounded-md border border-border px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-surface"
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
