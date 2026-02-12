import Image from "next/image";

type Member = {
  name: string;
  imageSrc?: string;
};

const placeholderAvatar =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%25' height='100%25' fill='%23313a4a'/></svg>";

const councilMembers: Member[] = [
  { name: "Bill" },
  { name: "HotSauce" },
  { name: "Jiners" },
  { name: "Minine" },
  { name: "Katsu" },
  { name: "Dasein" },
  { name: "Utopia" },
  { name: "Bip" },
  { name: "Kev" },
];

const executiveTeam: Member[] = [
  { name: "Dasein" },
  { name: "Utopia" },
  { name: "Bip" },
];

export default function Governance() {
  return (
    <section className="relative bg-gray-modern-900">
      <div className="relative overflow-hidden">
        <Image
          src="/bgs/bg-team.png"
          alt=""
          fill
          priority
          quality={100}
          unoptimized
          className="object-contain 5xl:object-cover  object-top"
        />
        <div className="relative max-w-480 mx-auto px-4 3xl:px-20 pt-20 pb-20 flex flex-col gap-20">
          <div className="text-center flex flex-col gap-4 items-center">
            <h2 className="text-white font-title text-[3rem] leading-11">
              Governance
            </h2>
            <p className=" text-white text-sm leading-5.5 tracking-[-2px] max-w-2xl mx-auto">
              Led by holders, operated by the community,
              <br />
              governed with transparency.
            </p>
          </div>

          <div
            className="rounded-lg p-6 flex flex-col gap-10"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, #9AA4B2, #9AA4B2 10px, transparent 10px, transparent 20px),
                repeating-linear-gradient(90deg, #9AA4B2, #9AA4B2 10px, transparent 10px, transparent 20px),
                repeating-linear-gradient(180deg, #9AA4B2, #9AA4B2 10px, transparent 10px, transparent 20px),
                repeating-linear-gradient(270deg, #9AA4B2, #9AA4B2 10px, transparent 10px, transparent 20px)
              `,
              backgroundSize: "1px 100%, 100% 1px, 1px 100%, 100% 1px",
              backgroundPosition: "0 0, 0 0, 100% 0, 0 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <p className="text-center text-white text-[2rem] tracking-[-1px] scale-x-75 origin-center">
              Council
            </p>
            {/* Layout Desktop */}
            <div className="hidden lg:flex flex-col gap-6">
              <div className="flex justify-between gap-6">
                {councilMembers.slice(0, 5).map((member) => (
                  <div
                    key={member.name}
                    className="flex flex-col items-center gap-9 p-9"
                  >
                    <div className="relative size-64 overflow-hidden rounded-sm border border-gray-modern-700 bg-gray-modern-800/80">
                      <Image
                        src={member.imageSrc ?? placeholderAvatar}
                        alt={member.name}
                        fill
                        sizes="256px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="text-white font-medium text-[1.5rem] font-title">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-6 pl-24">
                {councilMembers.slice(5).map((member) => (
                  <div
                    key={member.name}
                    className="flex flex-col items-center gap-9 p-9"
                  >
                    <div className="relative size-64 overflow-hidden rounded-sm border border-gray-modern-700 bg-gray-modern-800/80">
                      <Image
                        src={member.imageSrc ?? placeholderAvatar}
                        alt={member.name}
                        fill
                        sizes="256px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="text-white font-medium text-[1.5rem] font-title">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Mobile (< lg) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
              {councilMembers.map((member, index) => (
                <div
                  key={member.name}
                  className={`flex flex-col items-center gap-9 ${
                    index === councilMembers.length - 1
                      ? "sm:col-span-2 sm:justify-self-center"
                      : ""
                  }`}
                >
                  <div className="relative size-64 overflow-hidden rounded-sm border border-gray-modern-700 bg-gray-modern-800/80">
                    <Image
                      src={member.imageSrc ?? placeholderAvatar}
                      alt={member.name}
                      fill
                      sizes="256px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <span className="text-white font-medium text-[1.5rem] font-title">
                    {member.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-center text-white text-[2rem] tracking-[-1px] scale-x-75 origin-center">
              Executive team
            </p>

            {/* Layout Desktop */}
            <div className="mt-6 hidden lg:grid grid-cols-3 gap-6 w-full mx-auto">
              {executiveTeam.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center gap-9 p-9"
                >
                  <div className="relative size-64 overflow-hidden rounded-sm border border-gray-modern-700 bg-gray-modern-800/80">
                    <Image
                      src={member.imageSrc ?? placeholderAvatar}
                      alt={member.name}
                      fill
                      sizes="256px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <span className="text-white font-medium text-[1.5rem] font-title">
                    {member.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Layout Mobile (< lg) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
              {executiveTeam.map((member, index) => (
                <div
                  key={member.name}
                  className={`flex flex-col items-center gap-9 ${
                    index === executiveTeam.length - 1
                      ? "sm:col-span-2 sm:justify-self-center"
                      : ""
                  }`}
                >
                  <div className="relative size-64 overflow-hidden rounded-sm border border-gray-modern-700 bg-gray-modern-800/80">
                    <Image
                      src={member.imageSrc ?? placeholderAvatar}
                      alt={member.name}
                      fill
                      sizes="256px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <span className="text-white font-medium text-[1.5rem] font-title">
                    {member.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
