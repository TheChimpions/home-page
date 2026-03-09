import Image from "next/image";

const IMG = 200;

const frames = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
];

export default function HeroCarouselHorizontal() {
  const strip = [...frames, ...frames, ...frames];

  return (
    <div className="w-full overflow-hidden">
      <div
        className="animate-scroll-right flex w-max"
        style={{ gap: "2.55rem" }}
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
