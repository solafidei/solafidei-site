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
      {/* full-bleed light-streak backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/team.jpg)" }}
      />
      {/* legibility scrim, fading into the adjacent sections */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, var(--bg-base) 0%, rgba(10,8,16,0.82) 14%, rgba(10,8,16,0.82) 86%, var(--bg-base) 100%)",
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
