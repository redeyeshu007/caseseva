import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { COMPLETE_ENTER, COMPLETE_LEAVE, easeInOut, lerp } from "./assemblyTimeline";

const FORWARD_SECONDS = 1.5; // the event when the complete state is entered
const CANCEL_SECONDS = 0.45; // how fast a half-played event clears when the visitor scrolls back

/**
 * THE WHITE REFLECTION. When the scroll reaches the complete state, one white
 * light crosses the front of the scene: on the black, faceted core it travels
 * across the surface as a reflection, and a soft white wave and sheen spread
 * from the core across the viewport.
 *
 * It is driven by the scroll position, not remembered:
 *   • entering the complete state plays the event (once per entry);
 *   • leaving it clears the event at once (or, if it is half-played, runs it
 *     back quickly), and re-arms it, so entering again replays it.
 *
 * `sweepRef.t` (0–1, or −1 when idle) tells the core where the light is;
 * the page-wide overlay is written straight to the DOM from here, so nothing
 * re-renders.
 */
function ReflectionEffect({ progressRef, sweepRef, overlay, reducedMotion }) {
  const lightRef = useRef(null);
  const state = useRef({ complete: false, t: 0, shown: false });

  useFrame((_, delta) => {
    const light = lightRef.current;
    if (!light) return;
    const s = state.current;
    const p = progressRef.current.value;

    // Enter/leave the complete state, with a little hysteresis so it cannot flicker
    if (!s.complete && p >= COMPLETE_ENTER) s.complete = true;
    else if (s.complete && p < COMPLETE_LEAVE) s.complete = false;

    if (reducedMotion) {
      s.t = 0;
    } else if (s.complete) {
      s.t = Math.min(1, s.t + delta / FORWARD_SECONDS);
    } else if (s.t >= 1) {
      s.t = 0; // the event had finished: nothing to play back, just re-arm
    } else {
      s.t = Math.max(0, s.t - delta / CANCEL_SECONDS);
    }

    const t = s.t;
    const active = t > 0 && t < 1;
    sweepRef.current.t = active ? t : -1;

    if (active) {
      const travel = easeInOut(t);
      light.position.set(lerp(-3.6, 3.6, travel), lerp(1.6, -0.6, travel), 2.4);
      light.intensity = 22 * Math.pow(Math.sin(Math.PI * t), 1.5);
    } else {
      light.intensity = 0;
    }

    // Page-wide half: a soft white wave from the core and a broad sheen, both behind the copy
    const { wave, band, scene, section } = overlay?.current || {};
    if (!wave || !band) return;

    if (active) {
      const envelope = Math.sin(Math.PI * t);
      if (scene && section) {
        const c = scene.getBoundingClientRect();
        const r = section.getBoundingClientRect();
        wave.style.left = `${c.left - r.left + c.width / 2}px`;
        wave.style.top = `${c.top - r.top + c.height / 2}px`;
      }
      const grow = lerp(0.15, 1.4, 1 - Math.pow(1 - t, 3));
      wave.style.transform = `scale(${grow.toFixed(3)})`;
      wave.style.opacity = envelope.toFixed(3);
      band.style.transform = `translateX(${lerp(-65, 65, easeInOut(t)).toFixed(2)}%)`;
      band.style.opacity = envelope.toFixed(3);
      s.shown = true;
    } else if (s.shown) {
      wave.style.opacity = "0";
      band.style.opacity = "0";
      s.shown = false;
    }
  });

  return <pointLight ref={lightRef} color="#ffffff" intensity={0} distance={9} decay={2} />;
}

export default ReflectionEffect;
