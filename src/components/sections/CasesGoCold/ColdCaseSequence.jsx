import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import StageSegment from "./StageSegment";
import "./ColdCaseSequence.css";

const STAGES = [
  { number: "01", title: "IT HAPPENS" },
  { number: "02", title: "YOU SEARCH" },
  { number: "03", title: "YOU ASK AROUND" },
  { number: "04", title: "YOU RETELL IT AGAIN" },
  { number: "05", title: "FILES SCATTER" },
  { number: "06", title: "NOTHING IS BUILT" },
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** One stage: number, its point on the line, and the title. */
function ColdCaseStage({ number, title, index }) {
  return (
    <li className="cold-stage">
      <span className="cold-stage__num">{number}</span>
      <div className="cold-stage__rail">
        {index < STAGES.length - 1 && <StageSegment index={index} />}
        <span className="cold-stage__dot" aria-hidden="true" />
      </div>
      <h3 className="cold-stage__title">{title}</h3>
    </li>
  );
}

/**
 * The six "where cases go cold" stages on one horizontal line.
 *
 * A single ScrollTrigger (the site's existing GSAP setup) turns scroll into a
 * 0–1 progress for the whole sequence; each stage owns one sixth. That is
 * written to each stage as `--p` (its own progress) and `--pn` (the next
 * stage's), plus `data-state` (current / past / future). CSS draws the line and
 * its deterioration from those, so nothing re-renders while scrolling. The
 * progress is eased through one short tween so the motion glides.
 *
 * The whole section is pinned while the line is built: the page holds still,
 * the line draws and deteriorates stage by stage, and once the last stage is
 * reached the section is released and the page carries on scrolling.
 *
 * On narrow screens the row scrolls sideways instead of wrapping; the current
 * stage is brought into view as the story advances.
 */
function ColdCaseSequence() {
  const listRef = useRef(null);
  const reducedMotion = useReducedMotion();

  // Only make the row a keyboard-reachable scroll region when it actually overflows
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return undefined;

    const update = () => {
      if (list.scrollWidth > list.clientWidth + 2) list.setAttribute("tabindex", "0");
      else list.removeAttribute("tabindex");
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const stages = Array.from(list.children);
    const count = stages.length;

    // Reduced motion: the finished line, every stage at full strength
    if (reducedMotion) {
      stages.forEach((el) => {
        el.style.setProperty("--p", "1");
        el.style.setProperty("--pn", "1");
        el.dataset.state = "static";
      });
      return undefined;
    }

    registerGsap();

    let lastActive = -1;
    const apply = (progress) => {
      const local = stages.map((_, i) => clamp01(progress * count - i));
      const active = Math.min(count - 1, Math.floor(progress * count));

      stages.forEach((el, i) => {
        el.style.setProperty("--p", local[i].toFixed(3));
        el.style.setProperty("--pn", (local[i + 1] ?? 0).toFixed(3));
        const state = i === active ? "current" : i < active ? "past" : "future";
        if (el.dataset.state !== state) el.dataset.state = state;
      });

      // Narrow screens: keep the current stage in view as the story advances
      if (active !== lastActive) {
        lastActive = active;
        if (list.scrollWidth > list.clientWidth + 2) {
          list.scrollTo({ left: Math.max(0, stages[active].offsetLeft - 16), behavior: "smooth" });
        }
      }
    };

    const eased = { value: 0 };
    apply(0);

    // Pin the whole section (the heading stays put with the line). If it is ever taller
    // than the screen, pin from its top instead of its centre.
    const section = list.closest("section") || list;
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: () => (section.offsetHeight < window.innerHeight ? "center center+=36" : "top top+=72"),
      end: () => "+=" + Math.round(window.innerHeight * 1.05),
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        eased.value = self.progress;
        apply(self.progress);
      },
      onUpdate: (self) => {
        gsap.to(eased, {
          value: self.progress,
          duration: 0.6,
          ease: "power2.out",
          overwrite: true,
          onUpdate: () => apply(eased.value),
        });
      },
    });

    return () => {
      trigger.kill(true);
      gsap.killTweensOf(eased);
    };
  }, [reducedMotion]);

  return (
    <ol ref={listRef} className="cold-seq" aria-label="How a case goes cold">
      {STAGES.map((stage, index) => (
        <ColdCaseStage key={stage.number} index={index} {...stage} />
      ))}
    </ol>
  );
}

export default ColdCaseSequence;
