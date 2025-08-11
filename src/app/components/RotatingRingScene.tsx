"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type RotatingRingProps = {
  className?: string;
  gapAngleDeg?: number; // size of each cut-out gap in degrees
  thickness?: number; // ring thickness in scene units
  outerRadius?: number; // outer radius in scene units
  speed?: number; // rotation speed (radians per second)
};

export default function RotatingRingScene({
  className,
  gapAngleDeg = 30,
  thickness = 8,
  outerRadius = 42,
  speed = 0.6,
}: RotatingRingProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<() => void | undefined>(undefined);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(2.5, window.devicePixelRatio));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Read brand colors
    const styles = getComputedStyle(document.documentElement);
    const startHex = styles.getPropertyValue("--brand-start").trim() || "#22d3ee";
    const endHex = styles.getPropertyValue("--brand-end").trim() || "#a78bfa";
    const colorStart = new THREE.Color(startHex);
    const colorEnd = new THREE.Color(endHex);

    const outer = outerRadius;
    const inner = Math.max(1, outer - thickness);
    const segments = 256;
    const gap = THREE.MathUtils.degToRad(gapAngleDeg);

    // Shader material: aurora-like gradient that fades out towards the outside edge of the ring
    const uniforms: { [k: string]: { value: unknown } } = {
      uColor: { value: colorStart.clone() },
      uColor2: { value: colorEnd.clone() },
      uInner: { value: inner },
      uOuter: { value: outer },
      uOpacity: { value: 0.9 },
      uTime: { value: 0 },
      uFreq: { value: 6.0 },
      uSpeed: { value: 0.8 },
    };

    const vertexShader = `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec3 vPos;
      uniform vec3 uColor;
      uniform vec3 uColor2;
      uniform float uInner;
      uniform float uOuter;
      uniform float uOpacity;
      uniform float uTime;
      uniform float uFreq;
      uniform float uSpeed;
      void main() {
        float r = length(vPos.xy);
        // 0 at outer edge, 1 at inner edge
        float edge = clamp((uOuter - r) / max(0.0001, (uOuter - uInner)), 0.0, 1.0);
        // Angle in [0,1]
        float ang = atan(vPos.y, vPos.x);
        ang = (ang + 3.14159265) / (6.2831853);
        // Aurora banding across angle and radius with time flow
        float band = 0.5 + 0.5 * sin(ang * uFreq + uTime * uSpeed + r * 0.35);
        float band2 = 0.5 + 0.5 * sin(ang * (uFreq * 0.5) - uTime * (uSpeed * 0.6) + r * 0.9);
        float aurora = mix(band, band2, 0.5);
        // Edge falloff
        float alpha = pow(edge, 1.15) * (0.55 + 0.45 * aurora) * uOpacity;
        if (alpha < 0.01) discard;
        vec3 col = mix(uColor, uColor2, aurora);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // Each arc covers half the circle minus the gap
    const arcLen = Math.max(0.01, Math.PI - gap);
    const ringGroup = new THREE.Group();

    const seg1 = new THREE.Mesh(new THREE.RingGeometry(inner, outer, segments, 1, 0, arcLen), material);
    const seg2 = new THREE.Mesh(new THREE.RingGeometry(inner, outer, segments, 1, Math.PI, arcLen), material);
    ringGroup.add(seg1);
    ringGroup.add(seg2);

    // Optional: subtle outer halo using a faint, larger ring with same shader but lower opacity
    const haloUniforms: { [k: string]: { value: unknown } } = {
      uColor: { value: colorStart.clone() },
      uColor2: { value: colorEnd.clone() },
      uInner: { value: inner + 2 },
      uOuter: { value: outer + 6 },
      uOpacity: { value: 0.18 },
      uTime: { value: 0 },
      uFreq: { value: 5.0 },
      uSpeed: { value: 0.6 },
    };
    const haloMat = new THREE.ShaderMaterial({
      uniforms: haloUniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(new THREE.RingGeometry(inner + 2, outer + 6, segments, 1, 0, Math.PI * 2), haloMat);
    ringGroup.add(halo);

    // Inner counter-rotating ring (smaller, same style)
    const innerSpacing = -3; // no gap between rings (they touch)
    const outer2 = Math.max(2, inner - innerSpacing);
    const inner2 = Math.max(1, outer2 - thickness);

    const uniforms2: { [k: string]: { value: unknown } } = {
      uColor: { value: colorStart.clone() },
      uColor2: { value: colorEnd.clone() },
      uInner: { value: inner2 },
      uOuter: { value: outer2 },
      uOpacity: { value: 0.9 },
      uTime: { value: 0 },
      uFreq: { value: 6.0 },
      uSpeed: { value: 1.0 },
    };
    const material2 = new THREE.ShaderMaterial({
      uniforms: uniforms2,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const ringGroup2 = new THREE.Group();
    const seg1b = new THREE.Mesh(new THREE.RingGeometry(inner2, outer2, segments, 1, 0, arcLen), material2);
    const seg2b = new THREE.Mesh(new THREE.RingGeometry(inner2, outer2, segments, 1, Math.PI, arcLen), material2);
    ringGroup2.add(seg1b);
    ringGroup2.add(seg2b);

    // Halo for inner ring
    const haloUniforms2: { [k: string]: { value: unknown } } = {
      uColor: { value: colorStart.clone() },
      uColor2: { value: colorEnd.clone() },
      uInner: { value: inner2 + 2 },
      uOuter: { value: outer2 + 6 },
      uOpacity: { value: 0.16 },
      uTime: { value: 0 },
      uFreq: { value: 5.0 },
      uSpeed: { value: 0.6 },
    };
    const haloMat2 = new THREE.ShaderMaterial({
      uniforms: haloUniforms2,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const halo2 = new THREE.Mesh(new THREE.RingGeometry(inner2 + 2, outer2 + 6, segments, 1, 0, Math.PI * 2), haloMat2);
    ringGroup2.add(halo2);

    scene.add(ringGroup);
    scene.add(ringGroup2);

    // Animate
    let rafId = 0;
    const clock = new THREE.Clock();
    const fogColor = new THREE.Color(0x0b0f14);
    scene.fog = new THREE.FogExp2(fogColor, 0.0);

    function animate() {
      const t = clock.getElapsedTime();
      ringGroup.rotation.z = -speed * t; // clockwise (outer)
      ringGroup2.rotation.z = speed * t; // anti-clockwise (inner)
      const k = (Math.sin(t * 0.8) + 1) / 2;
      const col = colorStart.clone().lerp(colorEnd, k);
      (material.uniforms.uColor.value as THREE.Color).copy(col);
      (material.uniforms.uColor2.value as THREE.Color).copy(colorEnd);
      (material.uniforms.uTime.value as number) = t;
      (haloMat.uniforms.uColor.value as THREE.Color).copy(col);
      (haloMat.uniforms.uColor2.value as THREE.Color).copy(colorEnd);
      (haloMat.uniforms.uTime.value as number) = t;

      (material2.uniforms.uColor.value as THREE.Color).copy(col);
      (material2.uniforms.uColor2.value as THREE.Color).copy(colorEnd);
      (material2.uniforms.uTime.value as number) = t;
      (haloMat2.uniforms.uColor.value as THREE.Color).copy(col);
      (haloMat2.uniforms.uColor2.value as THREE.Color).copy(colorEnd);
      (haloMat2.uniforms.uTime.value as number) = t;

      const isDark = document.documentElement.classList.contains("dark");
      (scene.fog as THREE.FogExp2).density = isDark ? 0.0 : 0.004;
      if (!isDark) (scene.fog as THREE.FogExp2).color.set(0xe6f6ff);

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
      renderer.dispose();
      material.dispose();
      haloMat.dispose();
    };

    return cleanupRef.current;
  }, [gapAngleDeg, thickness, outerRadius, speed]);

  return (
    <div ref={mountRef} className={className || "pointer-events-none fixed inset-0 -z-10"} aria-hidden />
  );
}


