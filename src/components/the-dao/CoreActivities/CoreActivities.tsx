import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const activities = [
  {
    title: "Solana validator",
    description:
      "Running a validator to support the ecosystem and grow our treasury",
  },
  {
    title: "Elite Community",
    description: "Curating a collector & builder community focused on quality",
  },
  {
    title: "Alpha Sharing",
    description: "Sharing curated opportunities and insights with integrity",
  },
  {
    title: "Artist Support",
    description: "Supporting creators through collabs, events & custom drops",
  },
  {
    title: "Tool Building",
    description:
      "Creating tools and assets to help holders own their digital identity",
  },
  {
    title: "Builder Investment",
    description: "Supporting builders through early investment and feedback",
  },
];

export default function CoreActivities() {
  return (
    <section className="relative overflow-hidden bg-gray-modern-950">
      <Image
        src="/assets/purple-left.webp"
        alt=""
        width={780}
        height={1025}
        priority
        unoptimized
        className="pointer-events-none absolute -right-55 -top-100 h-[1025.158px] w-[780.92px] opacity-70 z-0"
      />
      <div className="relative z-10 max-w-480 mx-auto px-4 3xl:px-20 pb-24 lg:pb-32">
        <div className="text-center">
          <h2 className="text-white font-title text-[3rem] leading-11">
            Core activities
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-y-12 lg:gap-y-14">
          {activities.map((activity, i) => (
            <FadeUp key={activity.title} delay={i * 100}>
            <div className="text-center">
              <div className="flex justify-center">
                <Image
                  src="/assets/plus.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 animate-star-pulse"
                  style={{ animationDelay: `${i * 0.45}s` }}
                />
              </div>
              <h3 className="mt-4 text-white text-[2rem] font-bold leading-7">
                {activity.title}
              </h3>
              <p className="mt-2 text-gray-modern-400 text-xl leading-5 font-bold">
                {activity.description}
              </p>
            </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
