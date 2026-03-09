import Image from "next/image";

const IMG = 200;

const colLeft = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const colRight = ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
function ChimpColumn({
  frames,
  direction,
}: {
  frames: string[];
  direction: "up" | "down";
}) {
  const strip = [...frames, ...frames, ...frames];
  return (
    <div className="overflow-hidden h-full">
      <div
        className={
          direction === "up" ? "animate-scroll-up" : "animate-scroll-down"
        }
        style={{ display: "flex", flexDirection: "column", gap: "2.55rem" }}
      >
        {strip.map((name, i) => (
          <div key={i} className="shrink-0" style={{ width: IMG, height: IMG }}>
            <Image
              src={`/carousel/${encodeURIComponent(name)}v2.png`}
              alt=""
              width={IMG}
              height={IMG}
              quality={100}
              sizes="200px"
              className="w-full h-full object-contain [image-rendering:pixelated]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroCarousel() {
  return (
    <div className="flex gap-[2.55rem] h-full">
      <ChimpColumn frames={colLeft} direction="up" />
      <ChimpColumn frames={colRight} direction="down" />
    </div>
  );
}
