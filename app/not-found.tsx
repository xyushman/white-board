import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-foreground px-6 py-2 text-sm text-background transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}

