export default function OurHoldersHero() {
  return (
    <div className="flex flex-col gap-24 items-center justify-center text-center">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
          Behind every great
          <br />
          Chimpion is{" "}
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
            a great holder
          </span>
        </h1>
        <p className=" text-gray-modern-400 text-xl leading-5max-w-2xl mx-auto">
          Here&apos;s the community shaping the future of on-chain culture.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
          Our{" "}
          <span
            className="animate-gradient-flow"
            style={
              {
                background:
                  "linear-gradient(90deg, #EEB411 0%, #f8d063 25%, #EEB411 50%, #f8d063 75%, #EEB411 100%)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              } as React.CSSProperties
            }
          >
            Holders
          </span>
        </h2>
        <p className=" text-white text-xl leading-5">
          Meet the community members who own and shape The Chimpions ecosystem
        </p>
      </div>
    </div>
  );
}
