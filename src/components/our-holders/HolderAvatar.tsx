"use client";

import Image from "next/image";
import { useState } from "react";

interface HolderAvatarProps {
  src: string | null;
  alt: string;
}

export default function HolderAvatar({ src, alt }: HolderAvatarProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-modern-800/60">
        <Image
          src="/assets/chimps-aqua-marine.svg"
          alt={alt}
          width={48}
          height={48}
          className="w-1/2 h-1/2"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}
