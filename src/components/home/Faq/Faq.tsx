"use client";

import { useState } from "react";
import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const faqItems: {
  question: string;
  answer: string;
  link?: { text: string; href: string };
}[] = [
  {
    question: "What are the Chimpions?",
    answer:
      "A collection of 222 unique 1/1 hand-drawn pixel NFTs on Solana. It's not just a project — it's a place to build, share, and grow.",
  },
  {
    question: "When did it launch?",
    answer: "January 31, 2022 — fully whitelisted at 0.22 SOL.",
  },
  {
    question: "Who leads this?",
    answer:
      "Every 6 months, the Chimpions elect the council. Any member of the chiao can run for a seat. In April 2025, 8 members were elected to lead the Chimpions, alongside an executive team of 3 responsible for day-to-day operations.",
    link: { text: "Meet them here →", href: "/the-dao#governance" },
  },
  {
    question: "Do Chimpions have rarity rankings?",
    answer: "Nope. Each one is 1/1. Rarity is in the eye of the beholder.",
  },
  {
    question: "Who is the Chimpions artist?",
    answer:
      "All Chimpions were hand-drawn by Zen0, Zulp, Brink, and Rabbels. All animations were created by @katsudon., with collaborations from @zeroxxx and @duckzzy on 10 of them.",
  },
  {
    question: "What is the Treehouse?",
    answer:
      "A subcommunity for artists, collectors, and researchers. This is where thoughtful creation and signal-sharing happens.",
  },
  {
    question: "Why stake with the Chimpions validator?",
    answer:
      "You earn one of the best yields on your SOL, get access to the Treehouse section, and become eligible for future art edition airdrops.",
  },
  {
    question: "How does the DAO work?",
    answer:
      "The Chimpions DAO is governed by holders who participate in proposals, voting, and community initiatives. We focus on investing in builders, supporting art, and fostering Web3 culture through collective decision-making.",
  },
  {
    question: "What else should I know?",
    answer:
      "The Chimpions are a tight-knit community. If you have a question, don't hesitate to ask. If you'd prefer to connect directly with one of the Council Members, please do. We want to make sure you feel at home.",
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
                        <span className={`text-xl font-sans font-semibold transition-colors group-hover:text-gold-500 ${isOpen ? "text-gold-500" : "text-gray-modern-25"}`}>
                          {item.question}
                        </span>
                        <Image
                          src={
                            isOpen
                              ? "/assets/arrow-gold.png"
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
                          <p className="mt-2 text-gray-modern-400 text-xl leading-5">
                            {item.answer}
                            {item.link && (
                              <>
                                {" "}
                                <a
                                  href={item.link.href}
                                  className="text-gold-500 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.link.text}
                                </a>
                              </>
                            )}
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
