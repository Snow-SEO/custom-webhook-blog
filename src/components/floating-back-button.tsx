"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function FloatingBackButton({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Link>
  );
}
