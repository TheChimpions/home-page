export default function TreehouseHero() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
      <h1 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
        The{" "}
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
          Treehouse
        </span>
      </h1>

      <div className="flex flex-col gap-1 text-center">
        <p className="text-xl text-gray-modern-400 leading-5">
          An art and research center where signal thrives.
        </p>
        <p className="text-xl text-gray-modern-400 leading-5">
          A sub-community focused on art and research. It&apos;s a space to share, learn, and co-create where every contributor is welcomed.
        </p>
      </div>
    </div>
  );
}
