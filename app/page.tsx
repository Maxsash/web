import AnimatedLogo from "@/components/AnimatedLogo";

export default function Home() {
  return (
    <div>

        <div className="hero-content">
          <p className="eyebrow">
            Software • Games • Automation
          </p>

          <h1>
            MAXSASH
          </h1>

          <p className="subtitle">
            Crafting software with the patience of a shipwright.
            Apps, games, and tools built to last.
          </p>

          <div className="hero-buttons">
            <a href="#projects" className="primary">
              Explore Projects
            </a>

            <a href="#about" className="secondary">
              About Me
            </a>
          </div>
        </div>

        <AnimatedLogo />

    </div>
  );
}