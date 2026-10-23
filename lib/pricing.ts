export type PlanId = "free" | "pro" | "team";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  credits: number;
  highlight: boolean;
  cta: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Kick the tires and sketch your first ideas.",
    priceMonthly: 0,
    priceYearly: 0,
    credits: 3,
    highlight: false,
    cta: "Start for free",
    features: [
      "3 AI generations / month",
      "Unlimited boards",
      "Full Excalidraw canvas",
      "PNG export",
      "Autosave & cloud sync",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For builders who diagram every day.",
    priceMonthly: 12,
    priceYearly: 9,
    credits: 200,
    highlight: true,
    cta: "Upgrade to Pro",
    features: [
      "200 AI generations / month",
      "All 6 AI tools (diagram, flowchart, architecture, web & mobile mockups, mindmap)",
      "Priority Gemini model access",
      "High-resolution export",
      "Archive & trash history",
      "Email support",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "Shared whiteboards for the whole squad.",
    priceMonthly: 29,
    priceYearly: 24,
    credits: 1000,
    highlight: false,
    cta: "Start with Team",
    features: [
      "1,000 AI generations / month",
      "Everything in Pro",
      "5 seats included",
      "Shared team workspace",
      "Usage analytics",
      "Priority support",
    ],
  },
];

export const CREDIT_PACKS = [
  { credits: 50, price: 5 },
  { credits: 150, price: 12 },
  { credits: 500, price: 35 },
];
