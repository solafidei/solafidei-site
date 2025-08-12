import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Solafidei <onboarding@resend.dev>";
const emailTo = process.env.EMAIL_TO || "info@solafidei.com";
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  turnstileToken?: string;
  "cf-turnstile-response"?: string;
};

export async function POST(request: Request) {
  try {
    if (!resendApiKey) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const body = (await request.json()) as ContactPayload;
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();
    const captchaToken = ((body.turnstileToken || body["cf-turnstile-response"]) || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Verify Turnstile if secret is configured
    if (turnstileSecret) {
      if (!captchaToken) {
        return NextResponse.json({ error: "Captcha required." }, { status: 400 });
      }
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: turnstileSecret, response: captchaToken }),
        next: { revalidate: 0 },
      });
      const verifyJson = (await verifyRes.json()) as { success?: boolean; "error-codes"?: string[] };
      if (!verifyJson.success) {
        console.error("Turnstile verify failed", verifyJson);
        return NextResponse.json({ error: "Captcha verification failed.", codes: verifyJson["error-codes"] ?? [] }, { status: 400 });
      }
    }

    // Basic email format check
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
    }

    const subject = `New message from ${name} via solafidei.com`;
    const text = `From: ${name} <${email}>

${message}`;

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0B0F14;">
        <p style="margin: 0 0 8px;">New contact message from <strong>${name}</strong></p>
        <p style="margin: 0 0 16px;">Email: <a href="mailto:${email}">${email}</a></p>
        <div style="padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb;">
          <pre style="white-space: pre-wrap; word-break: break-word; margin: 0; font: inherit;">${escapeHtml(
            message
          )}</pre>
        </div>
      </div>
    `;

    const fromAddressOnly = extractAddress(emailFrom);
    const dynamicFrom = `${name} via Solafidei <${fromAddressOnly}>`;

    const { error } = await resend.emails.send({
      from: dynamicFrom,
      to: [emailTo],
      replyTo: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error:", JSON.stringify(err));
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractAddress(input: string): string {
  const match = input.match(/<([^>]+)>/);
  return match ? match[1] : input;
}


