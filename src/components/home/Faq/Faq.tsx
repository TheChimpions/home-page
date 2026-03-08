"use client";

import { useState } from "react";
import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const faqItems = [
  {
    question: "Lorem Ipsum Dolor Sit Amet",
    answer:
      "Lorem ipsum dolor sit amet lorem ipsum dolor. Lorem ipsum dolor sit amet lorem ipsum dolor.",
  },
  {
    question: "Lorem Ipsum Dolor Sit Amet",
    answer: "Lorem ipsum dolor sit amet lorem ipsum dolor.",
  },
  {
    question: "Lorem Ipsum Dolor Sit Amet",
    answer: "Lorem ipsum dolor sit amet lorem ipsum dolor.",
  },
  {
    question: "Lorem Ipsum Dolor Sit Amet",
    answer: "Lorem ipsum dolor sit amet lorem ipsum dolor.",
  },
  {
    question: "Lorem Ipsum Dolor Sit Amet",
    answer: "Lorem ipsum dolor sit amet lorem ipsum dolor.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative overflow-hidden bg-gray-modern-950 ">
      <Image
        src="/assets/purple-light.png"
        alt=""
        width={780}
        height={1025}
        priority
        unoptimized
        className="pointer-events-none absolute -left-85 -top-130 h-[1025.158px] w-[780.92px] opacity-85"
      />
      <div className="max-w-480 mx-auto px-4 3xl:px-20 xl:pt-25 pt-20">
        <div className="grid grid-cols-1 xl:grid-cols-[0.6fr_1.6fr] xl:gap-10 items-start">
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/logo/logo_bordered.png"
              alt=""
              width={320}
              height={320}
              unoptimized
              className="h-80 w-80 [image-rendering:pixelated] hidden xl:block animate-opacity-breathe"
            />
          </div>

          <div className="flex flex-col gap-10">
            <h2 className="text-white font-title text-[2.25rem] leading-8 sm:text-[36px] sm:leading-9.5">
              Frequent{" "}
              <span
                className="animate-gradient-flow"
                style={
                  {
                    background:
                      "linear-gradient(90deg, #c19110 0%, #f8d063 25%, #c19110 50%, #f8d063 75%, #c19110 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  } as React.CSSProperties
                }
              >
                Questions
              </span>
            </h2>

            <div className="divide-y divide-gray-modern-800">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <FadeUp key={`${item.question}-${index}`} delay={index * 80}>
                  <div
                    className="group py-6 cursor-pointer"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <button
                      type="button"
                      className="flex w-full justify-between items-center gap-6 text-left cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-gray-modern-25 text-xl font-sans font-semibold transition-colors group-hover:text-gold-500">
                        {item.question}
                      </span>
                      <Image
                        src={
                          isOpen
                            ? "/assets/faq-arrow-up.svg"
                            : "/assets/faq-arrow-down.svg"
                        }
                        alt=""
                        width={30}
                        height={30}
                        className="mt-1 shrink-0 size-5 sm:size-8 transition-transform group-hover:scale-110"
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-2 text-gray-modern-400 text-xl leading-5 max-w-xl">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
