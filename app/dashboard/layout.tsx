import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { CreditBadge } from "@/components/dashboard/credit-badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="sticky top-0 z-30 border-b border-[#dadada] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 tracking-tight"
          >
            <span className="relative inline-flex h-[9px] w-[9px]">
              <span className="absolute inset-0 rounded-full bg-black" />
              <span className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d12a1e]" />
            </span>
            <span className="text-sm font-medium tracking-[-0.01em]">
              AI Whiteboard
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <CreditBadge />
            <UserButton
              appearance={{ elements: { avatarBox: "size-8" } }}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}


