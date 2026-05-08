import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

type Member = {
  name: string;
  role?: string;
  imageSrc: string;
};

const councilMembers: Member[] = [
  { name: "BM", imageSrc: "/team/TheJovian-BM.gif" },
  { name: "HotSauce", imageSrc: "/team/TheUneasy-HotSauce.gif" },
  { name: "Johners", imageSrc: "/team/TheRoyal-johners.gif" },
  { name: "Minne", imageSrc: "/team/ThePensive-Minne.gif" },
  { name: "Katsu", imageSrc: "/team/TheRocker-Katsu.gif" },
  { name: "Dasein", imageSrc: "/team/TheStatic-Dasein.gif" },
  { name: "Utopia", imageSrc: "/team/TheSinged-Utopia.gif" },
  { name: "Kev", imageSrc: "/team/TheGrunt-Kev.gif" },
];

const executiveTeam: Member[] = [
  { name: "Tuxr", role: "CTO", imageSrc: "/team/TheBionic-tuxr.gif" },
  { name: "Max", role: "CEO", imageSrc: "/team/TheOriginal-Max.gif" },
  { name: "Jota", role: "CBO", imageSrc: "/team/TheMeathead-jota.gif" },
];

export default function Governance() {
  return (
    <section
      id="governance"
      className="relative bg-gray-modern-900 scroll-mt-16 min-[1400px]:scroll-mt-20"
    >
      <div className="relative overflow-hidden">
        <Image
          src="/bgs/bg-team.png"
          alt=""
          fill
          priority
          quality={100}
          className="object-contain 5xl:object-cover  object-top"
        />
        <div className="relative max-w-480 mx-auto px-4 3xl:px-20 pt-20 pb-20 flex flex-col gap-10">
          <div className="text-center flex flex-col gap-4 items-center">
            <h2 className="text-white font-title text-[3rem] leading-11">
              Governance
            </h2>
            <p className=" text-white text-xl leading-5 max-w-2xl mx-auto">
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
            <p className="text-center text-white text-[2.5rem]">Council</p>
            <div className="hidden lg:flex flex-col gap-6">
              <div className="grid grid-cols-5 gap-8">
                {councilMembers.slice(0, 5).map((member, i) => (
                  <FadeUp key={member.name} delay={i * 80}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full aspect-square overflow-hidden rounded-sm">
                        <Image
                          src={member.imageSrc}
                          alt={member.name}
                          fill
                          sizes="20vw"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <span className="text-white font-medium text-[1.5rem] font-title">
                        {member.name}
                      </span>
                    </div>
                  </FadeUp>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-8 px-[10%]">
                {councilMembers.slice(5).map((member, i) => (
                  <FadeUp key={member.name} delay={i * 80}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full aspect-square overflow-hidden rounded-sm">
                        <Image
                          src={member.imageSrc}
                          alt={member.name}
                          fill
                          sizes="20vw"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <span className="text-white font-medium text-[1.5rem] font-title">
                        {member.name}
                      </span>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
              {councilMembers.map((member, index) => (
                <FadeUp key={member.name} delay={index * 80}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-square overflow-hidden rounded-sm ">
                      <Image
                        src={member.imageSrc}
                        alt={member.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="text-white font-medium text-[1.5rem] font-title">
                      {member.name}
                    </span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-center text-white text-[2.5rem]">
              Executive team
            </p>

            <div className="mt-6 hidden lg:grid grid-cols-5 gap-8 w-full">
              <div />
              {executiveTeam.map((member, i) => (
                <FadeUp key={member.name} delay={i * 80}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-square overflow-hidden rounded-sm">
                      <Image
                        src={member.imageSrc}
                        alt={member.name}
                        fill
                        sizes="20vw"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-white font-medium text-[1.5rem] font-title">
                        {member.name}
                      </span>
                      {member.role && (
                        <span className="text-gray-modern-400 text-xl">
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
              <div />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
              {executiveTeam.map((member, index) => (
                <FadeUp key={member.name} delay={index * 80}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-square overflow-hidden rounded-sm">
                      <Image
                        src={member.imageSrc}
                        alt={member.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-white font-medium text-[1.5rem] font-title">
                        {member.name}
                      </span>
                      {member.role && (
                        <span className="text-gray-modern-400 text-xl">
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
