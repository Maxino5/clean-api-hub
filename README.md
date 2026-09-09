# API Builder Hub

Build a production-ready, clean web application for my Micro-SaaS API product. 

CRITICAL VISUAL DESIGN RULES (STRICT COMPLIANCE REQUIRED):

1. NO "A.I. VIBE CODED" UI: 

   - ABSOLUTELY NO EMOJIS anywhere in the copy, badges, buttons, or navigation.

   - ABSOLUTELY NO NEON LIGHTS, glowing borders, vibrant pink/purple/cyan accents, or artificial glow effects.

   - ABSOLUTELY NO GLASSMORPHISM, blurred translucent cards, ambient gradients, or decorative background blur bubbles.

   - ABSOLUTELY NO UNNECESSARY ICONS. Use clean text labels. Only use functional icons (like checkmarks or copy-to-clipboard) where strictly necessary.

   - DO NOT USE HYPHENS in headings or marketing copy unless grammatically required (no artificial corporate jargon or hyphenated fluff).

2. HUMAN-ENGINEERED AESTHETIC (UTILITY-FIRST DESIGN):

   - Palette: A strict, minimalist 2-color neutral palette. Stark white/off-white background (#FFFFFF or #F8FAFC), dark neutral slate text (#0F172A), and subtle gray borders (#E2E8F0).

   - Accents: Use a single, professional accent color for primary actions (e.g., solid deep blue #2563EB or pure black #000000).

   - Typography: Clean, high-readability sans-serif font (Inter or system-ui). Monospace font (Geist Mono or JetBrains Mono) strictly for code blocks and API keys.

   - Structure: Standard 1px solid borders, sharp or slightly rounded corners (border-radius maximum 6px), sharp layout grids, zero drop shadows (use subtle 1px border lines to separate sections).

   - Tone: Professional, direct, human-written technical documentation style. Minimalist and functional, like GitHub, Stripe, or Vercel docs.

APPLICATION STRUCTURE TO BUILD:

1. PUBLIC LANDING PAGE:

   - Top Nav: Simple text logo, "Docs", "Pricing", and a "Log In / Register" button.

   - Hero Section: Clear, direct headline describing the API utility. Subtitle explaining the problem it solves. 

   - Interactive Live Sandbox Component: A functional text-input and code block preview showing a sample JSON API request and response without needing a login.

   - Pricing Section: A simple 3-tier card layout (Free Tier: 100 requests/mo, Pro Tier: $29/mo, Scale Tier: $99/mo). Clean features list with plain text checkmarks.

2. AUTHENTICATION & DEVELOPER DASHBOARD (AUTHENTICATED STATE):

   - User Auth: Supabase Auth integration for Sign Up, Log In, and Password Reset.

   - API Key Portal: A clean card where logged-in users can generate, view, copy, or revoke their personal API key (`sk_live_...`).

   - Usage Tracker: A simple 1px bordered progress bar showing current monthly usage (e.g., "34 / 100 Free Requests Used").

   - Upgrade Trigger: A "Manage Subscription / Upgrade" button connected to a Stripe Checkout redirect flow.

Build this step-by-step. Start by creating the overall page structure, clean Tailwind typography, and the public landing page with the interactive API sandbox. Do not generate placeholder fluff text.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
