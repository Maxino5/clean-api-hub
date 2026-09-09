import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Keep in sync with PLAN_LIMITS in src/lib/account.functions.ts — the
// dashboard and this endpoint must agree on what each plan is allowed.
const PLAN_LIMITS = {
  free: 100,
  pro: 50000,
  scale: 250000,
};

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function firstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) return match[1].trim().replace(/\s+/g, ' ');
  }
  return '';
}

function screenshotSlugFor(url) {
  const host = new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '_');
  // NOTE: this does not render or store an actual screenshot yet — see the
  // comment on `data.screenshot_url` below.
  return `https://cdn.mysaas.com/shots/${host}.png`;
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Use POST for /api/capture' });
  }

  const apiKey = (req.headers['x-api-key'] || '').trim();

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing x-api-key header.',
    });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string' || !isValidHttpUrl(url)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Parameter "url" is required and must be a valid http(s) URL.',
    });
  }

  try {
    // 1. Verify API key
    const { data: keyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .is('revoked_at', null)
      .single();

    if (keyError || !keyRecord) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or revoked API key.',
      });
    }

    // 2. Fetch the linked account (for its plan)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('user_id, plan')
      .eq('user_id', keyRecord.user_id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({
        error: 'Account Not Found',
        message: 'No user account found linked to this API key.',
      });
    }

    const userPlan = (account.plan || 'free').toLowerCase();
    const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    // 3. Atomically check the quota and increment usage in one statement,
    // so two simultaneous requests can't both squeeze past the limit.
    const { data: usageRows, error: usageError } = await supabase.rpc(
      'increment_usage_if_allowed',
      { p_user_id: account.user_id, p_limit: limit },
    );

    if (usageError) {
      console.error('increment_usage_if_allowed failed:', usageError);
      return res.status(500).json({ error: 'Internal Error', message: 'Could not update usage.' });
    }

    const usage = usageRows?.[0];
    if (!usage) {
      return res.status(500).json({ error: 'Internal Error', message: 'Account usage record not found.' });
    }

    if (!usage.allowed) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: `Limit of ${limit} requests reached for the ${userPlan} plan.`,
        requests_used: usage.requests_used,
        limit,
      });
    }

    // 4. Fetch the target page and extract real metadata. Timeouts and fetch
    // failures still count against quota (the increment above already
    // happened), same as a successful capture, so they report status 502
    // rather than a generic 500.
    let html = '';
    let statusCode = 0;
    let finalUrl = url;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'CaptureAPI/1.0 (+https://api.mysaas.com)' },
      });
      clearTimeout(timer);
      statusCode = response.status;
      finalUrl = response.url || url;
      html = (await response.text()).slice(0, 400_000);
    } catch {
      return res.status(502).json({
        error: 'Fetch Failed',
        message: 'Target page could not be reached within the request timeout.',
        credits_remaining: limit - usage.requests_used,
      });
    }

    return res.status(200).json({
      status: 'success',
      // TODO: this is a placeholder, not a real screenshot. Wire this up to
      // an actual rendering service (e.g. a headless-browser API such as
      // Browserless or urlbox.io, or a self-hosted Puppeteer/Playwright
      // worker) before relying on this field in production.
      data: {
        target_url: url,
        screenshot_url: screenshotSlugFor(url),
        metadata: {
          title: firstMatch(html, [
            /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
            /<title[^>]*>([^<]+)<\/title>/i,
          ]),
          description: firstMatch(html, [
            /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
            /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
          ]),
          canonical_url: firstMatch(html, [
            /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
          ]) || finalUrl,
          status_code: statusCode,
        },
      },
      credits_remaining: limit - usage.requests_used,
    });
  } catch (error) {
    console.error('Unhandled error in /api/capture:', error);
    return res.status(500).json({ error: 'Internal Error', message: 'Something went wrong.' });
  }
};
