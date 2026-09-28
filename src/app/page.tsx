import { Hero } from "@/components/Hero";
import { Facts } from "@/components/Facts";
import { Method } from "@/components/Method";
import { Contents, Sections } from "@/components/Sections";
import facts from "@/data/facts.json";

export default function Home() {
  return (
    <main className="sheet">
      <Hero />
      <Contents hasFacts={facts.length > 0} />
      <Facts />
      <Sections />
      <Method />
    </main>
  );
}
