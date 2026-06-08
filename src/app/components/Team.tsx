"use client";

import { motion } from "framer-motion";
import { stagger, sectionReveal } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";

const people = [
  { name: "Solomon Razaq", role: "Founder", skills: "TypeScript, JavaScript, C#, SQL, GCP" },
  {
    name: "Innocent Munyadziwa",
    role: "Tech Lead",
    skills: "TypeScript, JavaScript, C#, SQL, Java, AWS, Azure, Terraform",
  },
  {
    name: "Muema Kamba",
    role: "Tech Lead",
    skills: "TypeScript, JavaScript, Java, Python, Go, Rust, AWS",
  },
  {
    name: "Daniel Jorge",
    role: "Mobile Developer",
    skills: "Flutter, React Native, Node.js, AWS, Firebase, Code Magic",
  },
  {
    name: "Den Radkevich",
    role: "Developer",
    skills: "TypeScript, JavaScript, React, React Native, NodeJS, SQL",
  },
  {
    name: "Nathan Boyega",
    role: "Product Strategy & Design",
    skills: "Product Strategy, Product Design, Design Systems",
  },
];

export function Team() {
  return (
    <section id="team" className="relative isolate overflow-hidden">
      {/* full-bleed light-streak backdrop (flipped); darkened + masked to
          transparent at top/bottom so the edges reveal the page background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rotate-180 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,8,16,0.82), rgba(10,8,16,0.82)), url(/streaks.jpg)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="Team" title="The people behind the" highlight="work." />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 flex flex-col"
        >
        {people.map((p) => (
          <motion.div key={p.name} variants={sectionReveal} className="border-t border-border py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-normal text-foreground">
                {p.name}
              </h3>
              <span className="text-xs uppercase tracking-[0.18em] text-muted">{p.role}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{p.skills}</p>
          </motion.div>
        ))}
        </motion.div>
      </div>
    </section>
  );
}
