"use client";

import { Clock, User, Layers, MessageCircle } from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: "Faster Time-to-Market",
      description:
        "Our agile approach gets your app into users’ hands quickly without compromising quality.",
    },
    {
      icon: User,
      title: "User-Centric Design",
      description:
        "We design with your users in mind, delivering intuitive and engaging experiences.",
    },
    {
      icon: Layers,
      title: "Scalable Architecture",
      description:
        "We build apps that grow with your business, avoiding costly rebuilds.",
    },
    {
      icon: MessageCircle,
      title: "Transparent Collaboration",
      description:
        "Frequent updates, clear timelines, and open communication at every stage.",
    },
  ];

  return (
    <section id="benefits" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-10">
        Benefits of working with us
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5 flex flex-col items-start gap-3"
          >
            <Icon className="h-8 w-8 text-emerald-500" />
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-black/70 dark:text-white/70">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}