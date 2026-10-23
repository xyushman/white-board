"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonCtaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ButtonCta({
  label = "Get Access",
  className,
  children,
  ...props
}: ButtonCtaProps) {
  return (
    <button
      className={cn(
        "group relative isolate inline-flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-[11px] px-8 leading-none outline-none",
        "transition-[transform,box-shadow] duration-500 ease-out active:translate-y-px",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "shadow-[0_10px_30px_-14px_rgba(41,28,15,0.4),0_0_0_1px_rgba(180,83,9,0.12)]",
        "hover:shadow-[0_22px_60px_-14px_rgba(180,83,9,0.45),0_0_0_1px_rgba(180,83,9,0.28)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(180,83,9,0) 250deg, rgba(180,83,9,0.9) 300deg, rgba(234,179,120,1) 330deg, rgba(217,119,6,0.7) 350deg, transparent 360deg)",
        }}
      />
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 animate-[spin_9s_linear_infinite] opacity-60 [animation-direction:reverse]"
        style={{
          background:
            "conic-gradient(from 180deg, transparent 0deg, transparent 280deg, rgba(217,119,6,0.6) 320deg, rgba(180,83,9,0.8) 350deg, transparent 360deg)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-[1.5px] rounded-[9.5px] bg-[#1c1611]"
      />
      <span
        aria-hidden
        className="absolute inset-[1.5px] rounded-[9.5px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(234,179,120,0.18) 0%, rgba(28,22,17,0) 42%, rgba(180,83,9,0.14) 100%)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-x-4 top-[1.5px] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,240,220,0.55), transparent)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-x-6 bottom-[1.5px] h-px opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(234,179,120,0.5), transparent)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-[1.5px] rounded-[9.5px] shadow-[inset_0_0_18px_rgba(180,83,9,0.25)] transition-shadow duration-500 group-hover:shadow-[inset_0_0_30px_rgba(234,179,120,0.4)]"
      />
      <span className="relative flex items-center justify-center gap-2 transition-transform duration-500 ease-out group-hover:-translate-y-px">
        <span className="whitespace-nowrap bg-gradient-to-b from-amber-100 to-amber-300 bg-clip-text text-[15px] font-medium tracking-[0.01em] text-transparent">
          {children ?? label}
        </span>
      </span>
    </button>
  );
}
