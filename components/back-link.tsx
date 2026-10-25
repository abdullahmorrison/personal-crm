import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} className="-ml-1 inline-flex rounded-full p-1 text-ink transition-colors hover:bg-surface">
      <ChevronLeft size={24} />
    </Link>
  );
}
