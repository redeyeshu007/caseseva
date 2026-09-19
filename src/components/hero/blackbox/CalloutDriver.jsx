import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CALLOUTS, activeCallout } from "./calloutData";
import { clamp01, range, smooth } from "./blackBoxMath";

const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 4);
const RUN_GAP = 8; // clear space between the end of the diagonal and the label text
const LINE_OPACITY = 0.7;

function hide(els) {
  if (!els) return;
  if (els.path) els.path.style.opacity = "0";
  if (els.dotStart) els.dotStart.style.opacity = "0";
  if (els.dotEnd) els.dotEnd.style.opacity = "0";
  if (els.box) els.box.style.opacity = "0";
}

/**
 * The 3D half of the callout system. Every frame it projects each callout's
 * real anchor (a child of the cube geometry) to screen space and redraws an
 * elbow leader: anchor → diagonal → horizontal run out to the label column.
 * It reads the same smoothed scroll progress as the cube, so lines and labels
 * stay in step with it, and it writes to the DOM through refs so nothing
 * re-renders while scrolling.
 *
 * Sequence for a stage: anchor dot → line grows → label fades in. Once a stage
 * has been revealed its line and label stay on screen; they only retract if the
 * visitor scrolls back up past that stage.
 */
function CalloutDriver({ registry, anchorsRef, progressRef, reducedMotion }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const point = useRef(new THREE.Vector3());
  const states = useRef(CALLOUTS.map(() => ({ g: 0, dim: 1, hidden: true, w: 0, measuredFor: 0 })));

  useFrame((_, delta) => {
    const { width: W, height: H } = size;
    if (!W || !H) return;

    const active = activeCallout(progressRef.current.value);
    const pad = Math.min(14, Math.max(8, W * 0.018));
    camera.updateMatrixWorld();

    CALLOUTS.forEach((callout, i) => {
      const els = registry.current[callout.key];
      const st = states.current[i];
      if (!els) return;

      const isActive = i === active;
      const target = i <= active ? 1 : 0;

      const grow = reducedMotion ? 1 : 1 - Math.exp(-delta * (target ? 4.5 : 9));
      st.g += (target - st.g) * grow;
      const dimTarget = isActive ? 1 : 0.8; // earlier stages stay clearly visible, just a touch quieter
      st.dim += (dimTarget - st.dim) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 6));

      if (st.g < 0.002) {
        if (!st.hidden) hide(els);
        st.hidden = true;
        return;
      }
      st.hidden = false;

      const anchor = anchorsRef.current[callout.key];
      if (!anchor || !els.path) return;

      // 3D anchor → screen pixels inside the visual
      anchor.getWorldPosition(point.current);
      point.current.project(camera);
      const ax = (point.current.x * 0.5 + 0.5) * W;
      const ay = (-point.current.y * 0.5 + 0.5) * H;

      // Elbow leader: 45° diagonal to the label's row, then a horizontal run out
      const ly = callout.row * H;
      const endX = callout.side === 0 ? W / 2 : callout.side < 0 ? pad : W - pad;
      // Side callouts: the horizontal run is at least as long as the label, so the
      // diagonal can never cut through the text. The bottom-centre callout (side 0)
      // has no run: its line just drops from the anchor to the middle of the visual.
      const centered = callout.side === 0;
      let bendX = W / 2;
      if (!centered) {
        if (st.measuredFor !== W) {
          st.w = els.box.offsetWidth;
          st.measuredFor = W;
        }
        const run = st.w + RUN_GAP;
        bendX = ax + callout.side * Math.abs(ly - ay);
        bendX = callout.side < 0 ? Math.max(bendX, endX + run) : Math.min(bendX, endX - run);
      }

      const lineProgress = reducedMotion ? 1 : easeOut(range(st.g, 0, 0.62));
      const labelProgress = reducedMotion ? 1 : smooth(range(st.g, 0.55, 1));
      const lineOpacity = LINE_OPACITY * (0.5 + 0.5 * st.dim);

      els.path.setAttribute(
        "d",
        centered
          ? `M${ax.toFixed(1)} ${ay.toFixed(1)}L${endX.toFixed(1)} ${ly.toFixed(1)}`
          : `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bendX.toFixed(1)} ${ly.toFixed(1)}L${endX.toFixed(1)} ${ly.toFixed(1)}`
      );
      els.path.style.strokeDashoffset = String(1 - lineProgress);
      els.path.style.opacity = String(lineOpacity);

      els.dotStart.setAttribute("cx", ax.toFixed(1));
      els.dotStart.setAttribute("cy", ay.toFixed(1));
      els.dotStart.style.opacity = String(Math.min(1, st.g * 3) * lineOpacity);

      els.dotEnd.setAttribute("cx", endX.toFixed(1));
      els.dotEnd.setAttribute("cy", ly.toFixed(1));
      els.dotEnd.style.opacity = String(smooth(range(lineProgress, 0.9, 1)) * lineOpacity);

      // Side labels sit just above their run, aligned to the outer end, and settle in from
      // 6px out. The centre label hangs 8px below its end dot and settles in from below.
      els.pos.style.transform = `translate(${endX.toFixed(1)}px, ${(centered ? ly + 8 : ly - 6).toFixed(1)}px)`;
      els.box.style.opacity = String(labelProgress * st.dim);
      const slide = (1 - labelProgress) * 6;
      els.box.style.translate = centered ? `0 ${slide.toFixed(2)}px` : `${(slide * callout.side).toFixed(2)}px 0`;
    });
  });

  return null;
}

export default CalloutDriver;
