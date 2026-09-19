import { useState } from "react";
import CaseSevaPreloader from "./components/preloader/CaseSevaPreloader";
import Navbar from "./components/navigation/Navbar";
import Hero from "./components/hero/Hero";
import SceneBackdrop from "./components/ui/SceneBackdrop";
import CasesGoCold from "./components/sections/CasesGoCold/CasesGoCold";
import Telling from "./components/sections/Telling/Telling";
import Assembly from "./components/sections/Assembly/Assembly";
import LivingRecord from "./components/sections/LivingRecord/LivingRecord";
import Crossfire from "./components/sections/Crossfire/Crossfire";
import Ledger from "./components/sections/Ledger/Ledger";
import Compass from "./components/sections/Compass/Compass";
import RobedHand from "./components/sections/RobedHand/RobedHand";
import Seal from "./components/sections/Seal/Seal";
import Boundaries from "./components/sections/Boundaries/Boundaries";
import FinalCTA from "./components/sections/FinalCTA/FinalCTA";
import Footer from "./components/footer/Footer";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <CaseSevaPreloader onComplete={() => setIsLoading(false)} />}
      <SceneBackdrop />
      <Navbar />
      <main>
        <Hero />
        <CasesGoCold />
        <Telling />
        <Assembly />
        <LivingRecord />
        <Crossfire />
        <Ledger />
        <Compass />
        <RobedHand />
        <Seal />
        <Boundaries />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

export default App;
