"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[200] h-[3px] origin-left bg-gradient-to-r from-[#9a3412] via-[#b45309] to-[#d99a5b]"
      style={{ scaleX }}
    />
  );
}
