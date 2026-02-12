import OurVision from "@/components/the-dao/OurVision/OurVision";
import Collection from "@/components/the-dao/Collection/Collection";
import CoreActivities from "@/components/the-dao/CoreActivities/CoreActivities";
import AboutCollection from "@/components/the-dao/AboutCollection/AboutCollection";
import Governance from "@/components/the-dao/Governance/Governance";
import CodeOfConduct from "@/components/the-dao/CodeOfConduct/CodeOfConduct";

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
