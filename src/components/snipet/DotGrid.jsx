import React, { useRef, useEffect } from "react";

const DotGrid = ({
  dotSize = 10,
  gap = 20,
  baseColor = "#5227FF",
  activeColor = "#FFFFFF",
  proximity = 100,
  shockRadius = 200,
  shockStrength = 6,
  resistance = 800,
  returnDuration = 1,
}) => {
  const canvasRef = useRef(null);

  // Convert HEX → RGB
  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map((x) => x + x).join("");
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  useEffect(() => {
    const baseRgb = hexToRgb(baseColor);
    const activeRgb = hexToRgb(activeColor);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Dot {
      constructor(x, y) {
        this.x = this.ox = x;
        this.y = this.oy = y;
        this.size = dotSize;
        this.color = baseRgb;
        this.offset = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
      }

      draw() {
        const dx = this.ox - mouse.x;
        const dy = this.oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const t = Math.min(dist / proximity, 1);
        const r = activeRgb.r * (1 - t) + baseRgb.r * t;
        const g = activeRgb.g * (1 - t) + baseRgb.g * t;
        const b = activeRgb.b * (1 - t) + baseRgb.b * t;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fill();
      }

      update() {
        this.velocity.x -= this.offset.x / resistance;
        this.velocity.y -= this.offset.y / resistance;

        this.offset.x += this.velocity.x;
        this.offset.y += this.velocity.y;

        this.x = this.x + this.offset.x;
        this.y = this.y + this.offset.y;

        this.offset.x -= (this.x - this.ox) / (returnDuration * 100);
        this.offset.y -= (this.y - this.oy) / (returnDuration * 100);
      }
    }

    const dots = [];
    const createGrid = () => {
      dots.length = 0;
      for (let x = gap / 2; x < width; x += gap) {
        for (let y = gap / 2; y < height; y += gap) {
          dots.push(new Dot(x, y));
        }
      }
    };

    createGrid();

    const mouse = { x: -9999, y: -9999 };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      dots.forEach((dot) => {
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < shockRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / shockRadius) * shockStrength;
          dot.velocity.x += Math.cos(angle) * force;
          dot.velocity.y += Math.sin(angle) * force;
        }
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createGrid();
    });

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      dots.forEach((dot) => {
        dot.update();
        dot.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [dotSize, gap, baseColor, activeColor, proximity, shockRadius, shockStrength, resistance, returnDuration]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default DotGrid;
