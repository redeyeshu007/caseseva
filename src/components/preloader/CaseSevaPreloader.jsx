import { useEffect, useState } from "react";
import ParticleText from "./ParticleText";
import "./CaseSevaPreloader.css";

function CaseSevaPreloader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 0.00s - 2.50s: Particle gathering + Stillness
    const startExitTimer = setTimeout(() => {
      setIsExiting(true);
      
      // Exit transition (0.45s)
      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 450);
      
      return () => clearTimeout(completeTimer);
    }, 2500);

    return () => clearTimeout(startExitTimer);
  }, [onComplete]);

  return (
    <div className={`caseseva-preloader ${isExiting ? "exiting" : ""}`} style={{ background: '#09090f' }}>
      <ParticleText
        text="CASESEVA"
        particleSize={2.2}
        density={4}
        color="#f8fafc"
        highlightColor="#ffffff"
        scatter={190}
        gatherDuration={1600}
        stagger={420}
        pointerRepel={42}
        repelRadius={120}
        idleDrift={0.8}
        trigger="mount"
        fontSize="clamp(5rem, 18vw, 13rem)"
        fontWeight={900}
        fontFamily="'Cinzel', serif"
        glow={false}
      />
    </div>
  );
}

export default CaseSevaPreloader;
