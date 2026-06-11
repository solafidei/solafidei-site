"use client";

// Single GSAP entry point — plugins registered once here. Import gsap from
// this module, never from "gsap" directly, so registration can't be missed.
//
// Division of labor (experience-rebuild intent): GSAP owns scroll
// choreography (ScrollTrigger), framer-motion owns UI state / entrances.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
