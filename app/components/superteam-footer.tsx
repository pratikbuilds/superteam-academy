"use client";

import React from "react";

export function SuperteamFooter() {
  const layers = 10;
  const offset = 4; // px

  return (
    <section className="relative w-full overflow-hidden bg-black flex items-end justify-center mt-auto h-[140px] md:h-[180px] lg:h-[220px]">
      <div className="relative w-full flex items-end translate-y-[35%]">
        <svg
          className="w-full h-auto font-sans font-black tracking-tighter"
          viewBox="0 0 1400 240"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="superteam-glow"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ffd23f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffb000" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient
              id="superteam-glow-faint"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ffd23f" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffb000" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Background layers */}
          {[...Array(layers)].map((_, i) => (
            <text
              key={i}
              x="50%"
              y="90%"
              textAnchor="middle"
              className="stroke-[url(#superteam-glow-faint)]"
              style={{
                fontSize: "200px",
                fill: "transparent",
                strokeWidth: 1,
                // Move layers UP and LEFT to match the wireframe isometric trail
                transform: `translate(-${(layers - i) * offset}px, -${(layers - i) * offset}px)`,
              }}
            >
              SUPERTEAM
            </text>
          ))}

          {/* The top layer */}
          <text
            x="50%"
            y="90%"
            textAnchor="middle"
            className="stroke-[url(#superteam-glow)]"
            style={{
              fontSize: "200px",
              fill: "transparent",
              strokeWidth: 1.5,
              transform: `translate(0px, 0px)`,
            }}
          >
            SUPERTEAM
          </text>
        </svg>
      </div>
    </section>
  );
}
