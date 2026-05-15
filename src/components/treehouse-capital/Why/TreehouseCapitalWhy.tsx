import FadeUp from "@/components/ui/FadeUp";

const modelColumns = [
  {
    heading: "Founders/Companies",
    numberClassName: "bg-[#d6dfd3] text-gray-modern-900",
    cardClassName: "bg-[#212F49]",
    items: [
      {
        title: "Single DAO Entity",
        description:
          "One single DAO entity on your cap table for simplified governance and decision-making.",
      },
      {
        title: "Immediate Exposure",
        description:
          "Immediate exposure to high-signal investors and power users in the Solana ecosystem.",
      },
      {
        title: "Optional Support",
        description:
          "Optional co-marketing, feedback, and support; we're fast, founder-friendly, and deeply embedded in Solana.",
      },
    ],
  },
  {
    heading: "Investors",
    numberClassName: "bg-aqua-marine-500 text-gray-modern-950",
    cardClassName: "bg-[#212F49]",
    items: [
      {
        title: "Exclusive Deal Access",
        description:
          "Exclusive and curated deal access to the best early-stage opportunities.",
      },
      {
        title: "Optional Participation",
        description:
          "Optional participation, choose your level of involvement in each investment.",
      },
      {
        title: "Shared Upside",
        description:
          "Seamless token distribution and upside shared with the DAO treasury.",
      },
    ],
  },
];

export default function TreehouseCapitalWhy() {
  return (
    <section className="mx-auto flex w-full flex-col gap-13">
      <h2 className="text-center font-title text-[2.5rem] leading-10 text-white sm:text-[3rem] sm:leading-11">
        Why{" "}
        <span
          className="animate-gradient-flow"
          style={
            {
              background:
                "linear-gradient(90deg, #eeb411 0%, #f8d063 25%, #eeb411 50%, #f8d063 75%, #eeb411 100%)",
              backgroundSize: "200% 100%",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            } as React.CSSProperties
          }
        >
          Treehouse Capital
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {modelColumns.map((column, columnIndex) => (
          <article
            key={columnIndex}
            className={`rounded-md border border-gray-modern-700 p-6 lg:p-10 shadow-[0_0_18px_rgba(0,0,0,0.25)] ${column.cardClassName}`}
          >
            <h3 className="mb-8 font-title text-[2.5rem] leading-10 text-white">
              {column.heading}
            </h3>
            <div className="flex flex-col gap-10 md:gap-20">
              {column.items.map((item, itemIndex) => (
                <FadeUp key={item.title} delay={itemIndex * 150}>
                  <div className="flex md:flex-row flex-col items-start gap-2 md:gap-6">
                    <div
                      className={`flex size-13 shrink-0 items-center justify-center rounded-xs text-[2rem] font-title leading-none ${column.numberClassName}`}
                    >
                      {itemIndex + 1}
                    </div>
                    <div>
                      <h4 className="text-[2rem] leading-8 text-white font-bold">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xl leading-5 text-gray-modern-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
