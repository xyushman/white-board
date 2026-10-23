"use client";

import { useUserStore } from "@/lib/store";

export function CreditBadge() {
  const credit = useUserStore((s) => s.user?.credit);

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#dadada] px-3 py-1 text-xs text-black">
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-[#d12a1e]" />
      </span>
      <span className="font-medium tabular-nums">
        {credit ?? "–"}
      </span>
      <span className="text-black/60">credits</span>
    </div>
  );
}

