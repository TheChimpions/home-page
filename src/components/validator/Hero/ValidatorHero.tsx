export default function ValidatorHero() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="text-white font-title text-[2.5rem] leading-10 sm:text-[3rem] sm:leading-12">
        Stake with purpose. Secure the network.{" "}
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
          Grow the DAO.
        </span>
      </h1>
    </div>
  );
}
