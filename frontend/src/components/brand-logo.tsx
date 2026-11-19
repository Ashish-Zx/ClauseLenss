"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";

const LOGO_SRC = "/gpt-image-2.6-flare (medium)_a_look_make_.svg_logo_.webp";

export function BrandLogo({
  compact = false,
  linked = false,
  className,
  onClick,
}: {
  compact?: boolean;
  linked?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const image = (
    <span
      className={cn(
        "brand-logo relative block overflow-hidden",
        compact ? "h-8 w-[44px]" : "aspect-[3/2] h-auto w-[200px]",
        className,
      )}
    >
      <Image
        src={LOGO_SRC}
        alt="ClauseLens"
        fill
        sizes={compact ? "36px" : "200px"}
        className="object-contain transition-[filter] duration-300 dark:invert"
        priority
      />
    </span>
  );

  if (linked) {
    return (
      <Link href="/" onClick={onClick} aria-label="ClauseLens home">
        {image}
      </Link>
    );
  }

  return image;
}
