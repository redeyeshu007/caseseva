import { useState } from "react";
import CaseSevaPreloader from "./components/preloader/CaseSevaPreloader";
import Navbar from "./components/navigation/Navbar";
import Hero from "./components/hero/Hero";
import SceneBackdrop from "./components/ui/SceneBackdrop";
import CasesGoCold from "./components/sections/CasesGoCold/CasesGoCold";

import Assembly from "./components/sections/Assembly/Assembly";
import RobedHand from "./components/sections/RobedHand/RobedHand";
import Seal from "./components/sections/Seal/Seal";
import Boundaries from "./components/sections/Boundaries/Boundaries";
import FinalCTA from "./components/sections/FinalCTA/FinalCTA";
import Footer from "./components/footer/Footer";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  // The heavy page (3D backdrop, GSAP sections) mounts only when the preloader starts fading,
  // so it doesn't compete with the particle animation for the main thread.
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      {isLoading && (
        <CaseSevaPreloader
          onExit={() =>
            // Let the fade start first; mounting the page is a long task on phones
            requestAnimationFrame(() => requestAnimationFrame(() => setShowContent(true)))
          }
          onComplete={() => {
            document.getElementById("boot-style")?.remove();
            setIsLoading(false);
          }}
        />
      )}
      {showContent && (
        <>
        <SceneBackdrop />
        <Navbar />
        <main>
          <Hero />
          <CasesGoCold />
          <Assembly />
          <RobedHand />
          <Seal />
          <Boundaries />
          <FinalCTA />
        </main>
        <Footer />
        </>
      )}
    </>
  );
}

export default App;
