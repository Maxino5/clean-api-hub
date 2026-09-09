import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  url: z.string().url().max(2048),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
  width: z.number().int().min(320).max(1920).default(1280),
  height: z.number().int().min(240).max(1920).default(720),
  fullPage: z.boolean().default(false),
});

export type CaptureResponse = {
  status: "success" | "error";
  execution_time_ms: number;
  data: {
    screenshot_url: string;
    metadata: {
      title: string;
      description: string;
      canonical_url: string;
      og_image: string;
      status_code: number;
    };
  };
  credits_remaining: number;
  message?: string;
};

function firstMatch(html: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) return match[1].trim().replace(/\s+/g, " ");
  }
  return "";
}

function slugFor(url: string, width: number, height: number, format: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "_");
  return `https://cdn.mysaas.com/shots/${host}_${width}x${height}.${format}`;
}

export const demoCapture = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CaptureResponse> => {
    const started = Date.now();
    const fallback = (statusCode: number, message?: string): CaptureResponse => ({
      status: message ? "error" : "success",
      execution_time_ms: Date.now() - started,
      data: {
        screenshot_url: slugFor(data.url, data.width, data.height, data.format),
        metadata: {
          title: "",
          description: "",
          canonical_url: data.url,
          og_image: "",
          status_code: statusCode,
        },
      },
      credits_remaining: 99,
      ...(message ? { message } : {}),
    });

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(data.url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "CaptureAPI/1.0 (+https://api.mysaas.com)" },
      });
      clearTimeout(timer);

      const html = (await response.text()).slice(0, 400_000);

      return {
        status: "success",
        execution_time_ms: Date.now() - started,
        data: {
          screenshot_url: slugFor(data.url, data.width, data.height, data.format),
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
            ]) || response.url,
            og_image: firstMatch(html, [
              /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
              /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
            ]),
            status_code: response.status,
          },
        },
        credits_remaining: 99,
      };
    } catch {
      return fallback(504, "Target page could not be reached within the request timeout.");
    }
  });
