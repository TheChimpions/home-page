import FadeUp from "@/components/ui/FadeUp";

export default function TreehouseCapitalPitchForm() {
  return (
    <section className="mx-auto w-full">
      <article className="relative overflow-hidden rounded-md bg-[#212F49] py-8 lg:py-12">
        <div className="relative z-10">
          <FadeUp>
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
              <div className="flex flex-col gap-4">
                <h2 className="text-[2.25rem] leading-10 text-white">
                  Pitch Your{" "}
                  <span
                    className="animate-gradient-flow font-bold"
                    style={
                      {
                        background:
                          "linear-gradient(90deg, #11EEB4 0%, #b9feeb 25%, #11EEB4 50%, #b9feeb 75%, #11EEB4 100%)",
                        backgroundSize: "200% 100%",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      } as React.CSSProperties
                    }
                  >
                    Forward-Thinking
                  </span>{" "}
                  Idea
                </h2>
                <p className="text-xl leading-5 text-gray-modern-400">
                  Have a game-changing idea? We want to hear it. Use our
                  submission form to share deal details.
                </p>
              </div>

              <a
                href="mailto:firstborn@chimpions.co"
                className="py-2 min-w-40 cursor-pointer rounded-sm bg-aqua-marine-500 px-20 text-xl font-bold leading-none text-gray-modern-950 transition-opacity hover:opacity-90 inline-block"
              >
                Contact Us
              </a>
            </div>
          </FadeUp>
        </div>
      </article>
    </section>
  );
}
