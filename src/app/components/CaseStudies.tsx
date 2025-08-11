"use client";
import Image from "next/image";
import React from "react";

export function CaseStudies() {
  const studies = [
    {
      title: "Linkup Social — Architecture Refactor & Cost Optimization",
      summary:
        "Linkup needed their architecture and design patterns refactored to improve scalability. We upgraded microservices to the latest .NET, terraformed the infrastructure, and reduced operating costs by 70% while improving reliability.",
      client: "Linkup Social",
      logo: "/linkup_logo.png",
    },
    {
      title: "Happy Hour Hoppy - Push Notifications Integration",
      summary: "Hoppy needed a push notifications system that they could use to send out marketing messages. We integrated firebase for this purpose and setup a user friendly section on their admin dashboard to manage the notifications and send based on a variety of dynamic rules.",
      client: "Happy Hour Hoppy",
      logo: "/hoppy_logo.png",
    },
    {
      title: "Linkup Social — Chat System Integration",
      summary: "Linkup needed a chat system that would be able to handle different types of messages, such as images, videos, and audio files. We created a microservice to handle these messages and integrated with the backend-frontend.",
      client: "Linkup Social",
      logo: "/linkup_logo.png",
    },
    {
      title: "Happy Hour Hoppy - Fix database migrations and deployments",
      summary: "Hoppy's existing database structure had tables that were creating directly into the database, instead of using migrations. This prevented us from having a single sourcec of truth. We re-did all their migrations and setup a CI/CD pipeline to deploy to their servers.",
      client: "Happy Hour Hoppy",
      logo: "/hoppy_logo.png",
    }
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
      onError={() => setCurrent("/logo_smaller.png")}
    />
  );
}


