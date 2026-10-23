"use client";

import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

export const ContainerScrollContext = createContext<MotionValue<number> | null>(null);

export const useContainerScroll = () => useContext(ContainerScrollContext);

export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rotate = useTransform(scrollYProgress, [0.5, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0.5, 1], isMobile ? [0.72, 0.92] : [1.06, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -110]);

  return (
    <ContainerScrollContext.Provider value={scrollYProgress}>
      <div
        ref={containerRef}
        className="relative flex h-[52rem] items-center justify-center p-2 md:h-[76rem] md:p-20"
      >
        <div className="relative w-full py-10 md:py-32" style={{ perspective: "1000px" }}>
          <motion.div
            style={{ translateY: translate }}
            className="mx-auto max-w-5xl text-center"
          >
            {titleComponent}
          </motion.div>
          <motion.div
            style={{
              rotateX: rotate,
              scale,
              boxShadow:
                "0 0 #0000000d, 0 9px 20px #b453091a, 0 37px 37px #b4530914, 0 84px 50px #b453090d, 0 149px 60px #b4530908",
            }}
            className="mx-auto -mt-10 h-[30rem] w-full max-w-6xl rounded-[26px] border border-border/80 bg-gradient-to-b from-[#f2ece1] to-card p-2 shadow-2xl md:-mt-14 md:h-[44rem] md:rounded-[34px] md:p-4"
          >
            <div className="h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card md:rounded-3xl">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </ContainerScrollContext.Provider>
  );
}
