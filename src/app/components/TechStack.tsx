"use client";

import { motion } from "framer-motion";
import { stagger, sectionReveal } from "./animations";

const groups = [
  { label: "Frontend", items: ["Next.js", "React", "React Native", "Flutter"] },
  { label: "Backend", items: [".NET / C#", "Node.js", "Python"] },
  { label: "Cloud & DevOps", items: ["AWS", "GCP", "Azure", "Terraform", "Firebase"] },
  { label: "Data", items: ["PostgreSQL", "SQL", "Redis"] },
];

export function TechStack() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* full-bleed particle backdrop — darkened + masked at edges to blend */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,8,16,0.84), rgba(10,8,16,0.84)), url(/stack.jpg)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase tracking-[0.25em] text-muted"
        >
          Our stack
        </motion.p>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {groups.map(({ label, items }) => (
            <motion.div key={label} variants={sectionReveal} className="border-t border-border pt-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-foreground">{label}</h3>
              <ul className="mt-5 space-y-2">
                {items.map((item) => (
                  <li key={item} className="text-sm text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
