"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = vec2(uv.x, 1.0 - uv.y);
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // --- Cursor-to-pixel vector ---
    vec2 toPixel = uv - uMouse;
    float dist = length(toPixel);
    vec2 dir = toPixel / (dist + 0.0001);

    // --- Magnetic displacement: push image away from cursor ---
    float radius = 0.3;
    float power = smoothstep(radius, 0.0, dist);
    float displace = power * power * uStrength * 0.08;
    vec2 displaced = uv + dir * displace;

    // --- Idle organic wave (always active) ---
    float wave = sin(uv.x * 4.0 + uTime * 0.6) * cos(uv.y * 3.0 + uTime * 0.4) * 0.003;
    displaced.x += wave;
    displaced.y += wave * 0.7;

    // --- Chromatic aberration at displacement edges ---
    float spread = displace * 3.0;
    vec2 rOffset = dir * spread;
    float r = texture2D(uTexture, displaced + rOffset).r;
    float g = texture2D(uTexture, displaced).g;
    float b = texture2D(uTexture, displaced - rOffset).b;
    vec3 color = vec3(r, g, b);

    // --- Warm terracotta spotlight near cursor ---
    float warmZone = smoothstep(0.45, 0.0, dist) * uStrength;
    color += vec3(0.14, 0.05, 0.0) * warmZone;

    // --- Rim highlight ring around displacement area (terracotta) ---
    float ring = smoothstep(0.02, 0.0, abs(dist - radius * 0.6)) * uStrength * 0.08;
    color += vec3(0.71, 0.42, 0.30) * ring;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface HeroDistortionProps {
  imageSrc: string;
  /** Fallback image used if imageSrc (e.g. a .webp) fails to decode. */
  fallbackSrc?: string;
  /** Called once the texture has loaded and the first frame is drawn. */
  onReady?: () => void;
  className?: string;
}

export default function HeroDistortion({
  imageSrc,
  fallbackSrc,
  onReady,
  className = "",
}: HeroDistortionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const strengthRef = useRef({ current: 0, target: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    function createShader(
      glCtx: WebGLRenderingContext,
      type: number,
      source: string
    ): WebGLShader | null {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader compile error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const uvLoc = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTexture = gl.getUniformLocation(program, "uTexture");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uStrength = gl.getUniformLocation(program, "uStrength");

    // Placeholder 1x1 texture (charcoal) until the image decodes
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([26, 26, 26, 255])
    );

    let textureReady = false;
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureReady = true;
      onReady?.();
    };
    img.onerror = () => {
      if (fallbackSrc && img.src !== fallbackSrc) img.src = fallbackSrc;
    };
    img.src = imageSrc;

    // Size the drawing buffer to the display size (via ResizeObserver, not
    // per-frame) capped at 2x DPR to avoid oversized buffers on retina.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    const handleMouseEnter = () => { strengthRef.current.target = 1.0; };
    const handleMouseLeave = () => { strengthRef.current.target = 0.0; };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Render loop — paused when the tab is hidden or the hero is offscreen.
    const startTime = performance.now();
    let running = true;

    const render = () => {
      if (!running) return;
      const time = (performance.now() - startTime) / 1000;

      // Smooth mouse lerp
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.08;
      m.y += (m.targetY - m.y) * 0.08;

      // Smooth strength
      const s = strengthRef.current;
      s.current += (s.target - s.current) * 0.06;

      if (textureReady) {
        gl.uniform1i(uTexture, 0);
        gl.uniform2f(uMouse, m.x, m.y);
        gl.uniform1f(uTime, time);
        gl.uniform1f(uStrength, s.current);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      rafRef.current = requestAnimationFrame(render);
    };

    const start = () => {
      if (running && rafRef.current) return;
      running = true;
      rafRef.current = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    rafRef.current = requestAnimationFrame(render);

    // Pause when the tab is backgrounded
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Pause when the hero scrolls out of view
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteTexture(texture);
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(uvBuffer);
    };
  }, [imageSrc, fallbackSrc, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
