"use client";
import React, { useEffect, useRef } from "react";

export default function AntigravityCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: any[] = [];
    const mouse = { x: 0, y: 0 };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    class Particle {
      x: number; y: number; baseX: number; baseY: number; size: number; density: number;
      constructor(x: number, y: number) {
        this.x = x; this.y = y;
        this.baseX = x; this.baseY = y;
        this.size = Math.random() * 2 + 1;
        this.density = (Math.random() * 30) + 1;
      }
      draw() {
        ctx!.fillStyle = "#3b82f6"; // Neon Blue to match your progress bars
        ctx!.shadowBlur = 10;
        ctx!.shadowColor = "#3b82f6";
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          this.x -= dx / 10;
          this.y -= dy / 10;
        } else {
          this.x += (this.baseX - this.x) * 0.05;
          this.y += (this.baseY - this.y) * 0.05;
        }
      }
    }

    handleResize();
    for (let i = 0; i < 150; i++) {
      particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.draw(); p.update(); });
      requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]" // Force it to the very top
    />
  );
}