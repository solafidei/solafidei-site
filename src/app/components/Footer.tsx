"use client";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Link href="#home" className="flex items-center gap-2">
            <Image src="/logo_smaller.png" alt="Solafidei" width={28} height={28} className="h-7 w-auto rounded" />
            <span className="font-semibold tracking-wide">SOLAFIDEI</span>
          </Link>
          <p className="mt-2 text-sm text-black/60 dark:text-white/70">We design and build modern, intuitive web and mobile apps to help you launch and scale with confidence.</p>
        </div>
        <div>
          <div className="font-medium">Links</div>
          <ul className="mt-2 space-y-1 text-sm text-black/70 dark:text-white/70">
            <li><a className="hover:text-black dark:hover:text-white" href="#services">Services</a></li>
            <li><a className="hover:text-black dark:hover:text-white" href="#benefits">Benefits</a></li>
            <li><a className="hover:text-black dark:hover:text-white" href="#about">Process</a></li>
            <li><a className="hover:text-black dark:hover:text-white" href="#work">Case studies</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Pages</div>
          <ul className="mt-2 space-y-1 text-sm text-black/70 dark:text-white/70">
            <li><a className="hover:text-black dark:hover:text-white" href="#home">Home</a></li>
            <li><a className="hover:text-black dark:hover:text-white" href="#about">About</a></li>
          
            <li><a className="hover:text-black dark:hover:text-white" href="#contact">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent dark:via-white/15" />
      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-black/50 text-sm dark:text-white/50">
        <div>© {new Date().getFullYear()} Solafidei. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a className="hover:text-black dark:hover:text-white" href="mailto:info@solafidei.com">info@solafidei.com</a>
          <a className="hover:text-black dark:hover:text-white" href="#">Privacy</a>
          <a className="hover:text-black dark:hover:text-white" href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}


