"use client";
import Image from "next/image";
import Link from "next/link";
import { GradientShimmerText } from "./GradientShimmerText";

export function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-12 pt-8">
      <div className="glass card-gradient-border rounded-2xl p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link href="#home" className="flex items-center gap-2">
              <Image
                src="/logo_opaque_smaller.png"
                alt="Solafidei"
                width={28}
                height={28}
                className="h-7 w-auto rounded"
              />
              <span className="font-heading font-semibold tracking-wide">
                <GradientShimmerText>SOLAFIDEI</GradientShimmerText>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">
              We design and build modern, intuitive web and mobile apps to help you launch and
              scale with confidence.
            </p>
          </div>
          <div>
            <div className="font-heading font-medium">Links</div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><a className="transition-colors hover:text-foreground" href="#services">Services</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#benefits">Benefits</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#about">Process</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#work">Case studies</a></li>
            </ul>
          </div>
          <div>
            <div className="font-heading font-medium">Pages</div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><a className="transition-colors hover:text-foreground" href="#home">Home</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#about">About</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
        <div className="mt-5 flex flex-col items-center justify-between gap-3 text-sm text-muted md:flex-row">
          <div>© {new Date().getFullYear()} Solafidei. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a className="transition-colors hover:text-foreground" href="mailto:info@solafidei.com">info@solafidei.com</a>
            <a className="transition-colors hover:text-foreground" href="#">Privacy</a>
            <a className="transition-colors hover:text-foreground" href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
