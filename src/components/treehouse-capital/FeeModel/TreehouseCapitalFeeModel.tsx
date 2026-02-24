const feeStats = [
  { value: "0%", label: "Unique holders" },
  { value: "15%", label: "Countries" },
  { value: "0%", label: "Whales (>5% holdings)" },
];

const modelColumns = [
  {
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

export default function TreehouseCapitalFeeModel() {
  return (
    <section className="mx-auto flex w-full flex-col gap-13">
      <div className="flex flex-col gap-12">
        <h2 className="text-center font-title text-[2.5rem] leading-10 text-white sm:text-[3rem] sm:leading-11">
          Fee{" "}
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
            Model
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {feeStats.map((stat) => (
            <article
              key={stat.label}
              className="text-center flex flex-col gap-4"
            >
              <p className="text-[4rem] font-bold leading-12 text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xl leading-5 text-gray-modern-400">
                {stat.label}
              </p>
            </article>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {modelColumns.map((column, columnIndex) => (
          <article
            key={columnIndex}
            className={`rounded-md border border-gray-modern-700 p-10 shadow-[0_0_18px_rgba(0,0,0,0.25)] ${column.cardClassName}`}
          >
            <div className="flex flex-col gap-20">
              {column.items.map((item, itemIndex) => (
                <div key={item.title} className="flex items-start gap-6">
                  <div
                    className={`flex size-13 shrink-0 items-center justify-center rounded-xs text-[2rem] font-title leading-none  ${column.numberClassName}`}
                  >
                    {itemIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-[2rem] leading-8 text-white font-bold">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xl leading-5 text-gray-modern-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
