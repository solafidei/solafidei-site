"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type BackgroundSceneProps = { className?: string; maskSrc?: string };

export default function BackgroundScene({ className, maskSrc }: BackgroundSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<() => void | undefined>(undefined);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(2.5, window.devicePixelRatio));
    renderer.setClearColor(0x000000, 0); // transparent
    mount.appendChild(renderer.domElement);

    // Particles
    const particles = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);
    for (let i = 0; i < particles; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * 160;
      positions[i3 + 1] = (Math.random() - 0.5) * 90;
      positions[i3 + 2] = (Math.random() - 0.5) * 160;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Create a circular sprite texture so points render as circles (not squares)
    const circleCanvas = document.createElement("canvas");
    circleCanvas.width = 128;
    circleCanvas.height = 128;
    const cctx = circleCanvas.getContext("2d")!;
    const cx = 64, cy = 64, cr = 60;
    const grad = cctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.7, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    cctx.fillStyle = grad;
    cctx.beginPath();
    cctx.arc(cx, cy, cr, 0, Math.PI * 2);
    cctx.fill();
    const circleTexture = new THREE.CanvasTexture(circleCanvas);
    circleTexture.needsUpdate = true;
    circleTexture.minFilter = THREE.LinearFilter;
    circleTexture.magFilter = THREE.LinearFilter;

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.6,
      map: circleTexture,
      transparent: true,
      opacity: 0.85,
      alphaTest: 0.05,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Attempt to reshape points into logo silhouette using a rasterized mask from public assets
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    (async () => {
      try {
        // Prefer provided maskSrc; else raster logo.png, then svg, then fallback
        const img = maskSrc
          ? await loadImage(maskSrc)
          : await loadImage("/logo.png").catch(() => loadImage("/logo.svg")).catch(() => loadImage("/file.svg"));
        const off = document.createElement("canvas");
        const ctx = off.getContext("2d", { willReadFrequently: true })!;
        // Larger mask resolution for better fidelity
        const targetW = 512;
        const targetH = 256;
        off.width = targetW;
        off.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        const scale = Math.min(targetW / img.width, targetH / img.height);
        const drawW = Math.max(1, Math.floor(img.width * scale));
        const drawH = Math.max(1, Math.floor(img.height * scale));
        const dx = Math.floor((targetW - drawW) / 2);
        const dy = Math.floor((targetH - drawH) / 2);
        ctx.drawImage(img, dx, dy, drawW, drawH);
        const data = ctx.getImageData(0, 0, targetW, targetH).data;
        const step = 2;
        const candidates: Array<{ x: number; y: number }> = [];
        for (let y = 0; y < targetH; y += step) {
          for (let x = 0; x < targetW; x += step) {
            const i = (y * targetW + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (a > 16 && luma > 16) {
              candidates.push({ x: (x / targetW) * 2 - 1, y: (y / targetH) * 2 - 1 });
            }
          }
        }
        if (candidates.length > 0) {
          const desired = Math.min(1200, candidates.length);
          const worldW = 160;
          const worldH = 90;
          const newPositions = new Float32Array(desired * 3);
          for (let i = 0; i < desired; i++) {
            const c = candidates[Math.floor(Math.random() * candidates.length)];
            const idx = i * 3;
            newPositions[idx + 0] = (c.x * worldW) / 2;
            newPositions[idx + 1] = (-c.y * worldH) / 2;
            newPositions[idx + 2] = (Math.random() - 0.5) * 30;
          }
          geometry.setAttribute("position", new THREE.BufferAttribute(newPositions, 3));
          geometry.attributes.position.needsUpdate = true;
        }
      } catch {
        // ignore if logo not found; fallback remains
      }
    })();

    // Gradient fog-like background tint
    const fogColor = new THREE.Color(0x0b0f14);
    scene.fog = new THREE.FogExp2(fogColor, 0.0);

    // Brand gradient colors (cyan -> violet)
    // Read CSS custom properties for brand colors to stay in sync with logo
    const styles = getComputedStyle(document.documentElement);
    const startHex = styles.getPropertyValue("--brand-start").trim() || "#22d3ee";
    const endHex = styles.getPropertyValue("--brand-end").trim() || "#a78bfa";
    const colorStart = new THREE.Color(startHex);
    const colorEnd = new THREE.Color(endHex);

    let rafId: number;
    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      // Gentle float to keep logo readable
      points.rotation.y = 0;
      points.rotation.x = 0;
      points.position.y = Math.sin(t * 0.6) * 1.2;
      points.position.x = Math.sin(t * 0.4) * 1.0;
      // Brand color lerp and theme-aware fog
      const html = document.documentElement;
      const isDark = html.classList.contains("dark");
      const k = (Math.sin(t * 0.6) + 1) / 2; // 0..1
      material.color.copy(colorStart).lerp(colorEnd, k);
      if (!isDark) {
        fogColor.set(0xe6f6ff);
        (scene.fog as THREE.FogExp2).color = fogColor;
        (scene.fog as THREE.FogExp2).density = 0.004;
      } else {
        (scene.fog as THREE.FogExp2).density = 0.0;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };

    return cleanupRef.current;
  }, [maskSrc]);

  return (
    <div
      ref={mountRef}
      className={className || "pointer-events-none fixed inset-0 -z-10"}
      aria-hidden
    />
  );
}


