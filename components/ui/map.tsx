"use client";

import { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";
import { useTheme } from "next-themes";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  regionDots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  showLabels?: boolean;
  labelClassName?: string;
  animationDuration?: number;
  loop?: boolean;
}

export function WorldMap({
  dots = [],
  regionDots = [],
  lineColor = "#0ea5e9",
  showLabels = true,
  labelClassName = "text-sm",
  animationDuration = 2,
  loop = true,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const map = useMemo(
    () => new DottedMap({ height: 100, grid: "diagonal" }),
    [],
  );

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: theme === "dark" ? "#FFFF7F40" : "#00000040",
        shape: "circle",
        backgroundColor: theme === "dark" ? "black" : "white",
      }),
    [map, theme],
  );

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const renderDots = (
    data: typeof dots,
    keyPrefix: string,
    isVisible: boolean,
  ) => {
    const staggerDelay = 0.3;
    const totalAnimationTime = data.length * staggerDelay + animationDuration;
    const pauseTime = 2;
    const fullCycleDuration = totalAnimationTime + pauseTime;

    // If we are zooming (hovered) and this is the region data, we apply inverse scaling
    const isZoomed = keyPrefix === "region" && isVisible;

    // Define sizes based on zoom state to counteract the map scaling
    const lineWidth = isZoomed ? "0.5" : "1";
    const dotRadius = isZoomed ? "1" : "3";
    const labelScale = isZoomed ? 0.2 : 1;

    return (
      <motion.g
        initial={{ opacity: isVisible ? 1 : 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {data.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime =
            (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;

          return (
            <g key={`${keyPrefix}-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth={lineWidth}
                initial={{ pathLength: 0 }}
                animate={
                  loop ? { pathLength: [0, 0, 1, 1, 0] } : { pathLength: 1 }
                }
                transition={
                  loop
                    ? {
                        duration: fullCycleDuration,
                        times: [0, startTime, endTime, resetTime, 1],
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 0,
                      }
                    : {
                        duration: animationDuration,
                        delay: i * staggerDelay,
                        ease: "easeInOut",
                      }
                }
              />

              {/* Glowing Points */}
              <g>
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r={dotRadius}
                  fill={lineColor}
                  className="drop-shadow-lg"
                  filter="url(#glow)"
                />
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r={dotRadius}
                  fill={lineColor}
                  className="drop-shadow-lg"
                  filter="url(#glow)"
                />
              </g>

              {/* Labels */}
              {showLabels && (
                <>
                  {/* Start Label */}
                  {dot.start.label && (
                    <motion.g
                      className="pointer-events-none"
                      // Scale down the label wrapper to counteract the map zoom
                      animate={{ scale: labelScale }}
                      // Set origin to the point position so it shrinks in place
                      style={{ originX: "50px", originY: "35px" }}
                    >
                      <foreignObject
                        x={startPoint.x - 50}
                        y={startPoint.y - 35}
                        width="100"
                        height="30"
                        className="overflow-visible"
                      >
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-white/90 dark:bg-black/90 text-black dark:text-white border border-gray-200 dark:border-gray-800 shadow-sm whitespace-nowrap">
                            {dot.start.label}
                          </span>
                        </div>
                      </foreignObject>
                    </motion.g>
                  )}
                  {/* End Label */}
                  {dot.end.label && (
                    <motion.g
                      className="pointer-events-none"
                      animate={{ scale: labelScale }}
                      style={{ originX: "50px", originY: "35px" }}
                    >
                      <foreignObject
                        x={endPoint.x - 50}
                        y={endPoint.y - 35}
                        width="100"
                        height="30"
                        className="overflow-visible"
                      >
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-white/90 dark:bg-black/90 text-black dark:text-white border border-gray-200 dark:border-gray-800 shadow-sm whitespace-nowrap">
                            {dot.end.label}
                          </span>
                        </div>
                      </foreignObject>
                    </motion.g>
                  )}
                </>
              )}
            </g>
          );
        })}
      </motion.g>
    );
  };

  return (
    <div
      className="w-full aspect-[2/1] md:aspect-[2.5/1] lg:aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans overflow-hidden border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="w-full h-full absolute inset-0"
        initial={{ scale: 1 }}
        animate={{
          scale: isHovered && regionDots.length > 0 ? 3.5 : 1,
        }}
        style={{ transformOrigin: "54% 20%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none object-cover"
          alt="world map"
          height="495"
          width="1056"
          draggable={false}
          priority
        />
        <svg
          ref={svgRef}
          viewBox="0 0 800 400"
          className="w-full h-full absolute inset-0 pointer-events-auto select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="path-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feMorphology operator="dilate" radius="0.5" />
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {renderDots(dots, "global", !isHovered)}
          {renderDots(regionDots, "region", isHovered)}
        </svg>
      </motion.div>
    </div>
  );
}
