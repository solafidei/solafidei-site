"use client";

export function Testimonials() {
  const items = [
    {
      quote:
        "Solafidei shipped our push notification system and cleaned up our DB migrations with a proper CI/CD pipeline. It’s faster to ship and far easier to maintain now.",
      author: "Cian Fawcett",
      role: "Co-Founder & CEO, Happy Hour Hoppy",
    },
    {
      quote:
        "Solafidei refactored our architecture, upgraded our microservices, and terraformed our infra — we’re more scalable and cut operating costs by 70%.",
      author: "Jack Peagam",
      role: "Co‑founder & CEO, Linkup Social",
    },
    {
      quote:
        "We needed a complex chat system supporting images, video, and audio. Solafidei delivered a robust service and seamless integration across our stack.",
      author: "Jack Peagam",
      role: "Co‑founder & CEO, Linkup Social",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold">Why teams choose Solafidei</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <div key={i} className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-black/80 dark:text-white/80">“{t.quote}”</p>
            <div className="mt-3 text-sm text-black/60 dark:text-white/70">{t.author}</div>
            <div className="text-xs text-black/50 dark:text-white/50">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


