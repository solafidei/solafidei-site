"use client";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Proof } from "./components/Proof";
import { Process } from "./components/Process";
import { Talk } from "./components/Talk";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import StarField from "./components/StarField";

// Solafidei — all-out experience site (beta rebuild).
// Scenes: arrive → what we build → proof → how we work → talk to us.
// Design intent: docs/intent/experience-rebuild.md

export default function SolafideiLanding() {
  return (
    <main className="relative min-h-screen text-white selection:bg-cyan-500/20">
      {/* ambient star layer — only visible in the calm near-black stretches */}
      <StarField />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Services />
        <Proof />
        <Process />
        <Talk />
        <Footer />
        <ScrollToTop />
      </div>
    </main>
  );
}
