"use client";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { TechStack } from "./components/TechStack";
import { Services } from "./components/Services";
import { CaseStudies } from "./components/CaseStudies";
import { Process } from "./components/Process";
import { Stats } from "./components/Stats";
import { Benefits } from "./components/Benefits";
import { Team } from "./components/Team";
import { Testimonials } from "./components/Testimonials";
import { FAQs } from "./components/FAQs";
import { CTASection } from "./components/CTASection";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

// Solafidei — "engineered, not decorated" experience site.
// Narrative: arrive → what we work with → what we build → proof → how we
// work → numbers → who we are → what clients say → talk to us.
// Design system: docs/intent/futuristic-redesign.md

export default function SolafideiLanding() {
  return (
    <main className="relative min-h-screen text-white selection:bg-cyan-500/20">
      <div className="relative z-10">
        <Nav />
        <Hero />
        <TechStack />
        <Services />
        <CaseStudies />
        <Process />
        <Stats />
        <Benefits />
        <Team />
        <Testimonials />
        <FAQs />
        <CTASection />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
