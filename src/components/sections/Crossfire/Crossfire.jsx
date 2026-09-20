import { useRef } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import CrossfireHeader from "./CrossfireHeader";
import CrossfireArena from "./CrossfireArena";
import CrossfireResult from "./CrossfireResult";
import CrossfireStage from "./CrossfireStage";
import { crossfirePairs } from "./crossfireData";
import { useCrossfireSequence } from "./useCrossfireSequence";
import "./Crossfire.css";

/**
 * Act VI — Crossfire. Every claim meets its objection before it leaves the
 * building: claim → challenge → test → supported / unresolved. Scroll drives
 * the whole sequence (and reverses it); see useCrossfireSequence.
 */
function Crossfire() {
  const sectionRef = useRef(null);
  const arenaRef = useRef(null);
  // Written by the scroll sequence, read by the WebGL scene
  const instrumentRef = useRef({
    pos: -1,
    appear: 0,
    meet: 0,
    turns: 0,
    tone: 0,
    claimAdv: 0,
    objAdv: 0,
    unresolved: 0,
    sumNorm: 0,
    reduced: false,
    invalidate: null,
    invalidateBackdrop: null,
  });
  const layoutRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useCrossfireSequence({
    sectionRef,
    arenaRef,
    pairs: crossfirePairs,
    instrumentRef,
    layoutRef,
    reducedMotion,
  });

  return (
    <section id="crossfire" className="crossfire section" data-bg="#ffffff" ref={sectionRef}>
      <CrossfireStage sectionRef={sectionRef} stateRef={instrumentRef} layoutRef={layoutRef} />
      <div className="container">
        <CrossfireHeader />
        <CrossfireArena pairs={crossfirePairs} arenaRef={arenaRef} />
        <CrossfireResult pairs={crossfirePairs} />
      </div>
    </section>
  );
}

export default Crossfire;
