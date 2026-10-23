"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/pricing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-ink">
          Pricing
        </span>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
          Simple plans, serious leverage
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Start free with 3 AI credits. Upgrade when your ideas outpace your
          quota — cancel anytime.
        </p>

        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Yearly
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                yearly ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent-soft text-accent-ink",
              )}
            >
              -25%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                plan.highlight
                  ? "border-accent/40 shadow-[0_30px_80px_-30px_rgba(180,83,9,0.4)] md:-translate-y-3 md:scale-[1.03]"
                  : "border-border",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wide text-paper shadow-lg">
                  MOST POPULAR
                </span>
              )}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  ${price}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  {price === 0 ? "forever" : "/mo"}
                </span>
              </div>
              {yearly && price > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  billed ${price * 12}/year
                </p>
              )}

              <div className="mt-5 flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-ink">
                <Sparkles className="size-4" />
                {plan.credits.toLocaleString()} AI credits / month
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants(),
                  "mt-7 w-full justify-center",
                  plan.highlight
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-foreground text-background hover:bg-foreground/90",
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Need more credits? Top up anytime — 50 · 150 · 500 credit packs available in-app.
      </p>
    </div>
  );
}
