import { useEffect, useRef, useState } from "react";
import ParticleText from "./ParticleText";
import "./CaseSevaPreloader.css";

const MOBILE_QUERY = "(max-width: 767px)";

// Track the breakpoint so the particle field is re-sampled with phone-friendly settings
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = e => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

function CaseSevaPreloader({ onExit, onComplete }) {
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isMobile = useIsMobile();

  // Keep the latest callbacks in refs so a parent re-render never restarts the timers
  const onExitRef = useRef(onExit);
  const onCompleteRef = useRef(onComplete);
  onExitRef.current = onExit;
  onCompleteRef.current = onComplete;

  // The clock starts once fonts have loaded and particles are sampled (isReady), so slow
  // font loading can't cut the gather animation short. 6s fallback if that never happens.
  useEffect(() => {
    const startExitTimer = setTimeout(() => {
      setIsExiting(true);
      onExitRef.current?.();
    }, isReady ? 2200 : 6000);

    return () => clearTimeout(startExitTimer);
  }, [isReady]);

  // Exit transition (0.45s)
  useEffect(() => {
    if (!isExiting) return undefined;
    const completeTimer = setTimeout(() => onCompleteRef.current?.(), 450);
    return () => clearTimeout(completeTimer);
  }, [isExiting]);

  return (
    <div className={`caseseva-preloader ${isExiting ? "exiting" : ""}`} style={{ background: '#09090f' }}>
      <ParticleText
        text="CASESEVA"
        particleSize={isMobile ? 1.6 : 2.2}
        density={isMobile ? 3 : 4}
        maxParticles={isMobile ? 1400 : 5200}
        maxDpr={isMobile ? 1.5 : 2}
        color="#f8fafc"
        highlightColor="#ffffff"
        scatter={isMobile ? 110 : 190}
        gatherDuration={1600}
        stagger={420}
        pointerRepel={isMobile ? 26 : 42}
        repelRadius={isMobile ? 70 : 120}
        idleDrift={0.8}
        trigger="mount"
        onReady={() => setIsReady(true)}
        fontSize={isMobile ? "clamp(2.5rem, 15vw, 5rem)" : "clamp(5rem, 18vw, 13rem)"}
        fontWeight={900}
        fontFamily="'Cinzel', serif"
        glow={false}
      />
    </div>
  );
}

export default CaseSevaPreloader;
