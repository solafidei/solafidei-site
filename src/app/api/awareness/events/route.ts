import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Solafidei <onboarding@resend.dev>";
const emailTo = process.env.AWARENESS_EMAIL_TO || process.env.EMAIL_TO || "info@solafidei.com";
const awarenessEventSecret = process.env.AWARENESS_EVENT_SECRET;
const rateLimitWindowMs = getPositiveNumber(process.env.AWARENESS_RATE_LIMIT_WINDOW_MS, 60_000);
const rateLimitMax = getPositiveNumber(process.env.AWARENESS_RATE_LIMIT_MAX, 20);
const awarenessRateLimit = new Map<string, { count: number; resetAt: number }>();

export const runtime = "nodejs";

type AwarenessEventPayload = {
  event?: string;
  rid?: string;
  campaign?: string;
  to?: string;
  from?: string;
  sig?: string;
  pageUrl?: string;
  referrer?: string;
  timezone?: string;
  language?: string;
  languages?: string[];
};

export async function POST(request: Request) {
  try {
    if (!resendApiKey) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    if (!awarenessEventSecret) {
      return NextResponse.json({ error: "Missing AWARENESS_EVENT_SECRET" }, { status: 500 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`awareness:${ip}`, rateLimitMax, rateLimitWindowMs)) {
      return NextResponse.json({ error: "Too many awareness events." }, { status: 429 });
    }

    const payload = (await request.json()) as AwarenessEventPayload;
    const event = sanitize(payload.event) || "opened_letter";
    if (event !== "opened_letter") {
      return NextResponse.json({ error: "Unsupported event." }, { status: 400 });
    }

    const recipientToken = sanitize(payload.rid);
    const campaign = sanitize(payload.campaign) || "default";
    const to = sanitize(payload.to) || "You";
    const from = sanitize(payload.from) || "Someone";
    const signature = sanitize(payload.sig);
    if (
      !recipientToken ||
      !isValidAwarenessSignature({
        secret: awarenessEventSecret,
        signature,
        rid: recipientToken,
        campaign,
        to,
        from,
      })
    ) {
      return NextResponse.json({ error: "Invalid awareness event signature." }, { status: 401 });
    }

    const pageUrl = sanitize(payload.pageUrl) || "not provided";
    const clientReferrer = sanitize(payload.referrer) || "not provided";
    const serverReferrer = sanitize(request.headers.get("referer")) || "not provided";
    const geo = getGeoHeaders(request);
    const occurredAt = new Date().toISOString();

    const rows = [
      ["Event", event],
      ["Recipient token", recipientToken],
      ["Campaign", campaign],
      ["To", to],
      ["From", from],
      ["Time", occurredAt],
      ["Client language", sanitize(payload.language) || "not provided"],
      ["Client languages", formatLanguages(payload.languages)],
      ["Timezone", sanitize(payload.timezone) || "not provided"],
      ["Page URL", pageUrl],
      ["Client referrer", clientReferrer],
      ["Server referrer", serverReferrer],
      ["Country", geo.country],
    ];

    const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 12px; color: #c0265d;">Awareness link clicked</h2>
        <p style="margin: 0 0 16px;">Someone opened the simulated letter.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${rows
              .map(
                ([label, value]) => `
                  <tr>
                    <th style="width: 180px; padding: 8px 10px; border: 1px solid #e5e7eb; background: #fff0f6; text-align: left; vertical-align: top;">${escapeHtml(
                      label,
                    )}</th>
                    <td style="padding: 8px 10px; border: 1px solid #e5e7eb; word-break: break-word;">${escapeHtml(
                      value,
                    )}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: [emailTo],
      subject: `Awareness link clicked: ${normalizeHeaderValue(recipientToken)}`,
      text,
      html,
    });

    if (error) {
      console.error("Awareness Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Awareness event error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return (
    sanitize(headers.get("cf-connecting-ip")) ||
    sanitize(headers.get("x-real-ip")) ||
    sanitize(headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()) ||
    sanitize(forwardedFor) ||
    "unknown"
  );
}

function getGeoHeaders(request: Request) {
  const headers = request.headers;

  return {
    country: sanitize(headers.get("cf-ipcountry")) || sanitize(headers.get("x-vercel-ip-country")) || "unknown",
  };
}

function sanitize(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 500);
}

function formatLanguages(value: unknown): string {
  if (!Array.isArray(value)) {
    return "not provided";
  }

  const languages = value.map(sanitize).filter(Boolean).slice(0, 10);
  return languages.length ? languages.join(", ") : "not provided";
}

function getPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeHeaderValue(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, 120) || "unknown";
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  for (const [entryKey, entry] of awarenessRateLimit) {
    if (entry.resetAt <= now) {
      awarenessRateLimit.delete(entryKey);
    }
  }

  const current = awarenessRateLimit.get(key);
  if (!current || current.resetAt <= now) {
    awarenessRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += 1;
  return true;
}

function isValidAwarenessSignature({
  secret,
  signature,
  rid,
  campaign,
  to,
  from,
}: {
  secret: string;
  signature: string;
  rid: string;
  campaign: string;
  to: string;
  from: string;
}): boolean {
  const normalizedSignature = signature.replace(/^sha256=/i, "");
  if (!/^[a-f0-9]{64}$/i.test(normalizedSignature)) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(JSON.stringify([rid, campaign, to, from]))
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(normalizedSignature, "hex");

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
