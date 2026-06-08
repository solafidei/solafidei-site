const columns = [
  {
    heading: "Links",
    links: [
      { label: "Services", href: "#services" },
      { label: "Benefits", href: "#benefits" },
      { label: "Process", href: "#about" },
      { label: "Case studies", href: "#work" },
    ],
  },
  {
    heading: "Pages",
    links: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden">
      {/* full-bleed particle backdrop for the bottom of the site */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/footer.jpg)" }}
      />
      {/* fade in from the page background + legibility scrim */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, var(--bg-base) 0%, rgba(10,8,16,0.6) 38%, rgba(10,8,16,0.55) 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <a
              href="#home"
              className="font-[family-name:var(--font-fraunces)] text-2xl font-normal text-foreground"
            >
              Solafidei
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              We design and build modern, intuitive web and mobile apps to help you launch and scale
              with confidence.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">{col.heading}</div>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a className="text-muted transition-colors hover:text-foreground" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Solafidei. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a className="transition-colors hover:text-foreground" href="mailto:info@solafidei.com">
              info@solafidei.com
            </a>
            <a className="transition-colors hover:text-foreground" href="#">
              Privacy
            </a>
            <a className="transition-colors hover:text-foreground" href="#">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
