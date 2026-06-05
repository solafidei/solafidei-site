"use client";

import { motion } from "framer-motion";
import { Layout, Server, Cloud, Database } from "lucide-react";
import { stagger, fadeInUp } from "./animations";

const groups = [
  { icon: Layout, label: "Frontend", items: ["Next.js", "React", "React Native", "Flutter"] },
  { icon: Server, label: "Backend", items: [".NET / C#", "Node.js", "Python"] },
  { icon: Cloud, label: "Cloud & DevOps", items: ["AWS", "GCP", "Azure", "Terraform", "Firebase"] },
  { icon: Database, label: "Data", items: ["PostgreSQL", "SQL", "Redis"] },
];

export function TechStack() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-xs uppercase tracking-[0.25em] text-muted"
      >
        Our stack
      </motion.p>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {groups.map(({ icon: Icon, label, items }) => (
          <motion.div key={label} variants={fadeInUp} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(167,139,250,0.18))] text-[var(--brand-start)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-heading text-sm font-medium">{label}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-[var(--bg-deep)]/50 px-3 py-1 font-mono text-xs text-foreground/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
