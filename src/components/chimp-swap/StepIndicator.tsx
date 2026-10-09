"use client";

import { Check } from "lucide-react";

export type WizardStep = 1 | 2 | 3 | 4;

export default function StepIndicator({
  current,
  size = "md",
}: {
  current: WizardStep;
  size?: "md" | "lg";
}) {
  const box =
    size === "lg"
      ? "w-10 h-10 sm:w-16 sm:h-16 text-lg sm:text-[2rem]"
      : "w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-[1.5rem]";
  const icon = size === "lg" ? "w-5 h-5 sm:w-10 sm:h-10" : "w-5 h-5 sm:w-7 sm:h-7";
  const bar = size === "lg" ? "w-8 sm:w-16" : "w-8 sm:w-12";

  return (
    <div className="flex items-center justify-center">
      {([1, 2, 3, 4] as const).map((n, i) => {
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div
              className={`${box} flex items-center justify-center rounded-sm font-bold font-sans transition-colors ${
                done
                  ? "bg-aqua-marine-800 text-gray-modern-950"
                  : active
                    ? "border-3 border-aqua-marine-800 text-white bg-gray-modern-900"
                    : "border border-gray-modern-700 text-gray-modern-500 bg-gray-modern-900"
              }`}
            >
              {done ? <Check className={`${icon} stroke-3`} /> : n}
            </div>
            {i < 3 && (
              <div
                className={`${bar} h-0.5 ${done ? "bg-aqua-marine-800" : "bg-gray-modern-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
