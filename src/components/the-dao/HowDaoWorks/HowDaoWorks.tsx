import FadeUp from "@/components/ui/FadeUp";

const councilItems = [
  "The DAO elects 8 Council Members every 6 months",
  "The Council manages the DAO treasury and approves Executive Team decisions",
  "Transactions require 5/8 multisig approvals via Squads",
];

const executiveItems = [
  "The CEO is elected by the DAO every 6 months",
  "The CEO appoints 2 Executive members",
  "They implement initiatives and manage operations",
];

export default function HowDaoWorks() {
  return (
    <section className="relative bg-gray-modern-950">
      <div className="max-w-480 mx-auto px-4 3xl:px-20 pb-10 pt-10 lg:pb-32 lg:pt-0">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-white font-title text-[3rem] leading-11">
              How the{" "}
              <span
                className="animate-gradient-flow"
                style={
                  {
                    background:
                      "linear-gradient(90deg, #B411EE 0%, #11EEB4 25%, #B411EE 50%, #11EEB4 75%, #B411EE 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  } as React.CSSProperties
                }
              >
                DAO Works
              </span>
            </h2>
            <p className="mt-4 text-gray-modern-400 text-xl leading-5 max-w-2xl mx-auto">
              The Chimpions DAO is collectively governed by its 222 NFT holders.
              Each Chimpion gives you the right to vote, propose, build, and
              earn.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="vision-card shooting-top group flex flex-col gap-6 rounded-md border border-gray-modern-800 bg-gray-modern-900 p-6 sm:p-8 shadow-[0_0_24px_rgba(0,0,0,0.25)] transition-all duration-300"
              style={{ "--card-color": "#B411EE" } as React.CSSProperties}
            >
              <h3 className="text-white text-[1.75rem] leading-7 font-bold transition-colors duration-300 group-hover:text-gray-modern-950">
                Chimpions Council
              </h3>
              <ul className="flex flex-col gap-4">
                {councilItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 rounded-xs bg-[#B411EE] shrink-0 transition-colors duration-300 group-hover:bg-gray-modern-950" />
                    <span className="text-gray-modern-300 text-xl leading-5 transition-colors duration-300 group-hover:text-gray-modern-950">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="vision-card shooting-top group flex flex-col gap-6 rounded-md border border-gray-modern-800 bg-gray-modern-900 p-6 sm:p-8 shadow-[0_0_24px_rgba(0,0,0,0.25)] transition-all duration-300"
              style={{ "--card-color": "#11EEB4" } as React.CSSProperties}
            >
              <h3 className="text-white text-[1.75rem] leading-7 font-bold transition-colors duration-300 group-hover:text-gray-modern-950">
                Executive Team
              </h3>
              <ul className="flex flex-col gap-4">
                {executiveItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 rounded-xs bg-[#11EEB4] shrink-0 transition-colors duration-300 group-hover:bg-gray-modern-950" />
                    <span className="text-gray-modern-300 text-xl leading-5 transition-colors duration-300 group-hover:text-gray-modern-950">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
