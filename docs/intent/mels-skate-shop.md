# Intent — Mel's Skate Shop cold pitch (deck + demo)

Owner-confirmed 2026-09-14 (orchestrator decision log #476–#485).

- **Outcome:** a cold-pitch package in this repo: an HTML deck at `/decks/mels-skate-shop` (design-canvas export, same pipeline as the LUX and Optimus decks) plus a clickable six-screen demo beside it at `/decks/mels-skate-shop/demo`, self-contained static HTML/CSS/JS so it does not inherit the Solafidei dark shell, fonts or splash. The deck links to the demo.
- **User:** the owner, presenting cold to Melony (Mel's Skate Shop, Midrand). The demo is what she clicks on her phone.
- **Why now:** research is done and verified (`agentic-code-orchestrator/docs/research/mels-skate-shop/benchmark-report.md`). The current site hides a real moat (first SA derby shop, verified Roll-Line dealer) and has five broken things demonstrable in a minute.
- **Success:** the deck opens a conversation that lands a monthly retainer — R0 upfront, 12-month minimum, site upkeep + PostPilot social bundled, rand figure left as a placeholder — for a Next.js storefront over her existing WooCommerce (headless).
- **Constraints:** roller derby leads; the Aura Sky 100 PDP carries the money story; server-rendered catalogue is a stated promise of the real build; realistic content pulled read-only from Mel's public WooCommerce Store API, hand-written fallback if blocked; builders pinned to sonnet; work on a branch and PR into `main`, never a direct push.
- **Six demo screens:** Home · Roller Derby hub · Aura Sky 100 PDP (per-size stock, lead time, instalment maths, heat-mould checkbox, Fit Guarantee line) · Size Finder → WhatsApp handoff · Book a fitting (on-domain) · canonical contact block on every template.
- **Out of scope:** the real build; any Woo/PayFast integration (fixture data only); the other nine MVP items and all phase 2/3 features; PostPilot wiring; contacting Mel from any channel; the price figure.
- **Process:** spec → plan → build, each reviewed by the owner before the next.
