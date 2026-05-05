import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Solafidei <onboarding@resend.dev>";
const emailTo = process.env.EMAIL_TO || "info@solafidei.com";
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

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

    if (!turnstileSecret) {
      return NextResponse.json({ error: "Captcha is not configured." }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const body = (await request.json()) as ContactPayload;
    const name = normalizeInput(body.name, MAX_NAME_LENGTH);
    const email = normalizeInput(body.email, MAX_EMAIL_LENGTH);
    const message = normalizeInput(body.message, MAX_MESSAGE_LENGTH);
    const captchaToken = ((body.turnstileToken || body["cf-turnstile-response"]) || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

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

    const emailOk = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
    }

    const subject = "New contact message via solafidei.com";
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const text = `From: ${name} <${email}>

${message}`;

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0B0F14;">
        <p style="margin: 0 0 8px;">New contact message from <strong>${escapedName}</strong></p>
        <p style="margin: 0 0 16px;">Email: <a href="mailto:${escapedEmail}">${escapedEmail}</a></p>
        <div style="padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb;">
          <pre style="white-space: pre-wrap; word-break: break-word; margin: 0; font: inherit;">${escapeHtml(
            message
          )}</pre>
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: emailFrom,
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

function normalizeInput(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
