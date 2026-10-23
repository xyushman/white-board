"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";

export interface ParallaxFrame {
  content: React.ReactNode;
  position?: string;
  scale?: number;
}

interface ZoomParallaxProps {
  frames: ParallaxFrame[];
  className?: string;
}

export function ZoomParallax({ frames, className }: ZoomParallaxProps) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const s4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const s5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const s6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const s8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const s9 = useTransform(scrollYProgress, [0, 1], [1, 9]);
  const scales = [s4, s5, s6, s5, s6, s8, s9];

  return (
    <div ref={container} className={className ?? "relative h-[300vh]"}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {frames.map((frame, index) => {
          const scale = scales[(frame.scale ?? index) % scales.length];
          const pos = frame.position ?? POSITIONS[index % POSITIONS.length];
          return (
            <motion.div
              key={index}
              style={{ scale }}
              className="absolute top-0 flex h-full w-full items-center justify-center"
            >
              <div className={`relative h-[25vh] w-[25vw] ${pos}`}>
                {frame.content}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const POSITIONS = [
  "",
  "!-top-[30vh] !left-[5vw] !h-[30vh] !w-[35vw]",
  "!-top-[10vh] !-left-[25vw] !h-[45vh] !w-[20vw]",
  "!left-[27.5vw] !h-[25vh] !w-[25vw]",
  "!top-[27.5vh] !left-[5vw] !h-[25vh] !w-[20vw]",
  "!top-[27.5vh] !-left-[22.5vw] !h-[25vh] !w-[30vw]",
  "!top-[22.5vh] !left-[25vw] !h-[15vh] !w-[15vw]",
];
