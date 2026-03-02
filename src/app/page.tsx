"use client";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { LogosBar } from "./components/LogosBar";
import { Services } from "./components/Services";
import { CaseStudies } from "./components/CaseStudies";
import { ExperienceWidgets } from "./components/ExperienceWidgets";
import { Process } from "./components/Process";
import { Benefits } from "./components/Benefits";
import { Testimonials } from "./components/Testimonials";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { SplashScreen } from "./components/SplashScreen";

// Solafidei — landing page inspired by Xtract's layout and IA
// Reference: https://plum-words-798095.framer.app/

// Shared animation variants moved to `components/animations.ts`

export default function SolafideiLanding() {
  return (
    <main className="relative min-h-screen text-white selection:bg-cyan-500/20">
      <SplashScreen durationMs={2800} />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <LogosBar />
        <Services />
        <CaseStudies />
        <ExperienceWidgets />
        <Process />
        <Benefits />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
