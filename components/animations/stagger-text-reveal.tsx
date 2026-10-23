"use client";

import { motion } from "motion/react";
import { useInView } from "@/hooks/use-in-view";
import { splitTextToWords } from "@/lib/utils";

export function StaggerTextReveal({
  text,
  className,
  delay = 0,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const { ref, inView } = useInView();
  const words = splitTextToWords(text);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.25em" }}
      aria-label={text}
    >
      {words.map((word: string, i: number) => (
        <span key={i} style={{ overflow: "hidden", display: "inline-block" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={
              inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }
            }
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * 0.05,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
