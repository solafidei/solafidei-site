// Global ambient layer: animated mesh-gradient aurora blobs over a deep base.
// Rendered once in the root layout, fixed behind all content.
export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* base wash */}
      <div className="absolute inset-0 bg-[var(--bg-deep)]" />

      {/* aurora blobs */}
      <div
        className="aurora-blob aurora-anim-a -top-32 -left-24 h-[40rem] w-[40rem]"
        style={{ background: "radial-gradient(circle, var(--brand-start), transparent 70%)" }}
      />
      <div
        className="aurora-blob aurora-anim-b top-1/3 -right-32 h-[42rem] w-[42rem]"
        style={{ background: "radial-gradient(circle, var(--brand-end), transparent 70%)" }}
      />
      <div
        className="aurora-blob aurora-anim-a bottom-0 left-1/4 h-[34rem] w-[34rem]"
        style={{ background: "radial-gradient(circle, var(--aurora-3), transparent 70%)", opacity: 0.35 }}
      />

      {/* subtle grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* vignette to keep edges calm and text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(5,5,7,0.75) 100%)",
        }}
      />
    </div>
  );
}
