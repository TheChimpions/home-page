"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon: string;
  placeholder?: string;
  containerClassName?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  icon,
  placeholder: _placeholder = "Select...", // eslint-disable-line @typescript-eslint/no-unused-vars
  containerClassName,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = value || options[0];

  return (
    <div ref={selectRef} className={containerClassName ?? "relative w-full xl:w-87.5"}>
      <Image
        src={icon}
        alt=""
        width={20}
        height={20}
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 z-10"
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer appearance-none rounded-sm border border-gray-modern-800 bg-gray-modern-950 pl-10 pr-10 py-4 text-xl text-white text-left outline-none focus:border-gray-modern-600 transition-colors"
      >
        {selectedOption}
      </button>

      <Image
        src="/assets/select.svg"
        alt=""
        width={20}
        height={20}
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2"
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-sm border border-gray-modern-800 bg-gray-modern-950 shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(index === 0 ? "" : option);
                setIsOpen(false);
              }}
              className="w-full cursor-pointer px-4 py-3 text-xl text-white text-left hover:bg-gray-modern-800 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
