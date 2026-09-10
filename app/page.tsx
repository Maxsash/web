import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Writing from "@/components/Writing";
import Elsewhere from "@/components/Elsewhere";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <a className="skip" href="#work">
        Skip to the work
      </a>

      <Hero />

      <main>
        <Work />
        <Writing />
        <Elsewhere />
      </main>

      <SiteFooter />
    </>
  );
}
