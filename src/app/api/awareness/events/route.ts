import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Solafidei <onboarding@resend.dev>";
const emailTo = process.env.AWARENESS_EMAIL_TO || process.env.EMAIL_TO || "info@solafidei.com";

type AwarenessEventPayload = {
  event?: string;
  rid?: string;
  campaign?: string;
  to?: string;
  from?: string;
  pageUrl?: string;
  referrer?: string;
  timezone?: string;
  language?: string;
  languages?: string[];
  platform?: string;
  userAgent?: string;
  screen?: {
    width?: number;
    height?: number;
    pixelRatio?: number;
  };
  viewport?: {
    width?: number;
    height?: number;
  };
};

export async function POST(request: Request) {
  try {
    if (!resendApiKey) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    const payload = (await request.json()) as AwarenessEventPayload;
    const event = sanitize(payload.event) || "opened_letter";
    const recipientToken = sanitize(payload.rid) || "not provided";
    const campaign = sanitize(payload.campaign) || "default";
    const to = sanitize(payload.to) || "not provided";
    const from = sanitize(payload.from) || "not provided";
    const pageUrl = sanitize(payload.pageUrl) || "not provided";
    const clientReferrer = sanitize(payload.referrer) || "not provided";
    const serverReferrer = sanitize(request.headers.get("referer")) || "not provided";
    const ip = getClientIp(request);
    const userAgent = sanitize(request.headers.get("user-agent")) || sanitize(payload.userAgent) || "unknown";
    const clientHints = getClientHints(request);
    const geo = getGeoHeaders(request);
    const occurredAt = new Date().toISOString();

    const rows = [
      ["Event", event],
      ["Recipient token", recipientToken],
      ["Campaign", campaign],
      ["To", to],
      ["From", from],
      ["Time", occurredAt],
      ["IP", ip],
      ["User agent", userAgent],
      ["Client platform", sanitize(payload.platform) || "not provided"],
      ["Client language", sanitize(payload.language) || "not provided"],
      ["Client languages", payload.languages?.map(sanitize).filter(Boolean).join(", ") || "not provided"],
      ["Timezone", sanitize(payload.timezone) || "not provided"],
      ["Screen", formatSize(payload.screen?.width, payload.screen?.height, payload.screen?.pixelRatio)],
      ["Viewport", formatSize(payload.viewport?.width, payload.viewport?.height)],
      ["Page URL", pageUrl],
      ["Client referrer", clientReferrer],
      ["Server referrer", serverReferrer],
      ["Country", geo.country],
      ["Region", geo.region],
      ["City", geo.city],
      ["Client hints", clientHints],
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
      subject: `Awareness link clicked: ${recipientToken}`,
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
    region: sanitize(headers.get("x-vercel-ip-country-region")) || "unknown",
    city: sanitize(headers.get("x-vercel-ip-city")) || "unknown",
  };
}

function getClientHints(request: Request): string {
  const headers = request.headers;
  const hints = [
    ["sec-ch-ua", headers.get("sec-ch-ua")],
    ["sec-ch-ua-mobile", headers.get("sec-ch-ua-mobile")],
    ["sec-ch-ua-platform", headers.get("sec-ch-ua-platform")],
  ]
    .map(([label, value]) => (value ? `${label}: ${value}` : null))
    .filter(Boolean);

  return hints.length ? hints.join("; ") : "not provided";
}

function formatSize(width?: number, height?: number, pixelRatio?: number): string {
  if (!width || !height) {
    return "not provided";
  }

  return pixelRatio ? `${width}x${height} @${pixelRatio}x` : `${width}x${height}`;
}

function sanitize(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 500);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
