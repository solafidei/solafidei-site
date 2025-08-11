"use client";
import Image from "next/image";
import React from "react";

export function CaseStudies() {
  const studies = [
    {
      title: "Linkup Social — Scalability, Reliability & Messaging",
      summary:
        "Linkup needed their architecture and design patterns refactored to improve scalability. We upgraded microservices to the latest .NET, terraformed the infrastructure, and reduced operating costs by 70% while improving reliability. We also delivered a chat system able to handle images, videos, and audio files by creating a dedicated microservice and integrating it with the backend and frontend.",
      client: "Linkup Social",
      logo: "/linkup_logo.png",
    },
    {
      title: "Happy Hour Hoppy — Push Campaigns, Migrations & CI/CD",
      summary:
        "Hoppy needed a push notifications system they could use to send out marketing messages. We integrated Firebase and set up a user‑friendly section on their admin dashboard to manage notifications and send based on a variety of dynamic rules. We also fixed database migrations (tables had been created directly instead of via migrations), re‑did all migrations to restore a single source of truth, and set up a CI/CD pipeline to deploy to their servers.",
      client: "Happy Hour Hoppy",
      logo: "/hoppy_logo.png",
    },
  ];
  return (
    <section id="work" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold">Case Studies</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-black/60">
        See how Solafidei delivers real-world impact for our clients.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {studies.map((study, idx) => (
          <div key={idx} className="rounded-2xl border border-black/10 bg-white/70 p-6 flex flex-col dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              {study.logo && <Logo src={study.logo} alt={`${study.client} logo`} />}
              <div className="font-semibold text-lg">{study.title}</div>
            </div>
            <div className="mt-2 text-sm text-black/60 flex-1 dark:text-white/70">{study.summary}</div>
            <div className="mt-4 text-xs text-black/50 dark:text-white/50">Client: {study.client}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Logo({ src, alt }: { src: string; alt: string }) {
  const [current, setCurrent] = React.useState(src);
  return (
    <Image
      src={current}
      alt={alt}
      width={96}
      height={24}
      className="h-6 w-auto"
      onError={() => setCurrent("/logo_opaque_smaller.png")}
    />
  );
}


