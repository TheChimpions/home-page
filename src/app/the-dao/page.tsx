import type { Metadata } from "next";
import OurVision from "@/components/the-dao/OurVision/OurVision";
import Collection from "@/components/the-dao/Collection/Collection";
import CoreActivities from "@/components/the-dao/CoreActivities/CoreActivities";
import AboutCollection from "@/components/the-dao/AboutCollection/AboutCollection";
import Governance from "@/components/the-dao/Governance/Governance";
import CodeOfConduct from "@/components/the-dao/CodeOfConduct/CodeOfConduct";

export const metadata: Metadata = {
  title: "The DAO",
  description:
    "The Chimpions DAO — a community-driven organization where holders vote on proposals, shape the future of the project, and build together.",
  openGraph: {
    title: "The DAO | The Chimpions",
    description:
      "The Chimpions DAO — a community-driven organization where holders vote on proposals, shape the future of the project, and build together.",
  },
};

export default function TheDaoPage() {
  return (
    <div className="relative">
      <OurVision />
      <Collection />
      <CoreActivities />
      <AboutCollection />
      <Governance />
      <CodeOfConduct />
    </div>
  );
}
