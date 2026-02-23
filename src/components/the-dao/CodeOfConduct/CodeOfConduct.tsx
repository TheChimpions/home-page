import Image from "next/image";

const expectedItems = [
  "Strive to be excellent to all people and help whenever possible",
  "Treat each other with kindness and respect, and foster an inclusive environment",
  "Remember your actions reflect on the whole Chimpions community",
];

const notExpectedItems = [
  "Spamming, scamming, or deceiving",
  "Discrimination or harassment",
  "Market manipulation or unethical trading",
  "Lending Chimpions for temporary benefit access",
  "Sharing personal/confidential info without consent",
];

export default function CodeOfConduct() {
  return (
    <section className="relative bg-gray-modern-950">
      <div className="max-w-480 mx-auto px-4 3xl:px-20 pb-10 pt-10 lg:pb-32 lg:pt-32">
        <div className="relative overflow-hidden rounded-md border border-gray-modern-800 bg-gray-modern-900 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <div className="absolute right-0 top-0">
            <img src="/assets/texture_top.png" alt="" className="object-fit" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-gray-modern-900/30 to-gray-modern-900/85" />
          </div>

          <div className="relative px-6 sm:px-10 pt-10 pb-8">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <h2 className="text-white font-title text-[3rem] leading-11">
                  Code of{" "}
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
                    Conduct
                  </span>
                </h2>
                <p className=" text-white text-xl leading-5">
                  <span className="inline-block">
                    By joining The Chimpions community, you agree to follow the
                    values and guidelines set by the CHIAO.
                  </span>
                  <span className="inline-block">
                    {" "}
                    We promote a respectful, family atmosphere, where everyone
                    can contribute, grow, and thrive.{" "}
                  </span>
                  <span className="inline-block">
                    {" "}
                    Integrity and kindness are not optional - they&apos;re what
                    makes this place special.
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-start gap-4">
                    <Image
                      src="/assets/expected.svg"
                      alt=""
                      width={60}
                      height={60}
                    />
                    <h3 className="text-aqua-marine-400 text-[2rem] leading-6 font-bold">
                      Expected
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {expectedItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 size-1.5 rounded-xs bg-gold-500 shrink-0" />
                        <span className="text-gray-modern-25 text-base max-w-full lg:max-w-md leading-5">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-start gap-4">
                    <Image
                      src="/assets/not-expected.svg"
                      alt=""
                      width={60}
                      height={60}
                    />
                    <h3 className="text-[#FF2C30] text-[2rem] leading-6 font-bold">
                      Not Expected
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {notExpectedItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 size-1.5 rounded-xs bg-gold-500 shrink-0" />
                        <span className="text-gray-modern-25 text-base leading-5">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-10 rounded-sm  bg-gray-modern-800 p-6 lg:text-center">
              <p className="text-gray-modern-25 text-xl leading-5 flex flex-col">
                <span className="w-full">
                  Violations may lead to disciplinary actions, reviewed and
                  voted on by the CHIAO.
                </span>
                <span className="w-full">
                  Contact a Council member for any concerns - do not escalate
                  publicly.
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-15 text-center text-gray-modern-25 text-xl leading-5 flex flex-col ">
          <span>Let&apos;s keep this space clean, thoughtful, and real. </span>
          <span>Thanks for being here. 🐵❤️</span>
        </p>
      </div>
    </section>
  );
}
