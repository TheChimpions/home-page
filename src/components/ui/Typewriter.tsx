"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  hideCursorUntilStart?: boolean;
  snapCursorOnDone?: boolean;
}

export default function Typewriter({
  text,
  delay = 600,
  speed = 28,
  className,
  hideCursorUntilStart = false,
  snapCursorOnDone = false,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      setStarted(true);
      const tick = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(tick);
          if (snapCursorOnDone) {
            setDone(true);
          } else {
            setTimeout(() => setDone(true), 800);
          }
        }
      }, speed);
      return () => clearInterval(tick);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay, speed, snapCursorOnDone]);

  const showCursor = !done && (!hideCursorUntilStart || started);

  return (
    <span className={className}>
      {displayed}
      <span
        className="inline-block w-0.5 h-[1em] ml-0.5 align-middle bg-current"
        style={{
          opacity: showCursor ? 1 : 0,
          animation: showCursor
            ? "tw-blink 0.7s ease-in-out infinite"
            : undefined,
        }}
      />
    </span>
  );
}
