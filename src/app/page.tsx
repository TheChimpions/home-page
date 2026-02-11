import Hero from "@/components/home/Hero/Hero";
import Stats from "@/components/home/Stats/Stats";
import About from "@/components/home/About/About";
import Ecosystem from "@/components/home/Ecosystem/Ecosystem";
import Faq from "@/components/home/Faq/Faq";
import JoinCta from "@/components/home/JoinCta/JoinCta";

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <Stats />
      <About />
      <Ecosystem />
      <Faq />
      <JoinCta />
    </div>
  );
}
