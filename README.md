This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment

Required production variables:

- `RESEND_API_KEY`: API key used by contact and awareness notification emails.
- `EMAIL_FROM`: verified sender address, for example `Solafidei <hello@solafidei.com>`.
- `EMAIL_TO`: recipient for contact form submissions.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key rendered on the contact form.
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key verified by `/api/contact`.
- `AWARENESS_EVENT_SECRET`: shared secret used to sign awareness campaign links.
- `AWARENESS_EMAIL_TO`: optional recipient for awareness event emails.

Awareness links must include a `sig` parameter. The signature is:

```txt
hex(hmac_sha256(AWARENESS_EVENT_SECRET, JSON.stringify([rid, campaign, to, from])))
```

The awareness endpoint uses the request IP only for transient rate limiting. Notification emails intentionally omit IP address, user agent, screen size, and viewport data.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
