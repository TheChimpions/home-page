"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpStatProps {
  end: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function CountUpStat({
  end,
  decimals = 0,
  suffix = "",
  duration = 1400,
  className,
}: CountUpStatProps) {
  const [display, setDisplay] = useState(
    end === 0 ? "0" : (0).toFixed(decimals),
  );
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    started.current = false;
    const resetFrame = requestAnimationFrame(() => setDisplay((0).toFixed(decimals)));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const startTime = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setDisplay((end * ease).toFixed(decimals));
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(end.toFixed(decimals));
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(resetFrame);
      observer.disconnect();
    };
  }, [end, decimals, duration]);

  const finalText = `${end.toFixed(decimals)}${suffix}`;

  return (
    <span
      ref={ref}
      className={className}
      style={{
        fontVariantNumeric: "tabular-nums",
        position: "relative",
        display: "inline-block",
      }}
    >
      <span
        style={{ visibility: "hidden", display: "block", whiteSpace: "nowrap" }}
      >
        {finalText}
      </span>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        {display}
        {suffix}
      </span>
    </span>
  );
}
