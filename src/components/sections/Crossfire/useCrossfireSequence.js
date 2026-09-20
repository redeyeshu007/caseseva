import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { clamp01, instrumentPosition, masterToLocal, pairPhases, seg, smooth } from "./crossfireTimeline";

const fmt = (v) => v.toFixed(3);

// Keep in step with the @media blocks in Crossfire.css
const PINNED_QUERY = "(min-width: 861px) and (min-height: 760px)";
const FLOW_QUERY = "(max-width: 860px), (max-height: 759px)";

/** Eases a raw 0–1 ScrollTrigger progress through one short tween so the sequence glides. */
function easedDriver(apply) {
  const eased = { value: 0 };
  return {
    set(value) {
      gsap.killTweensOf(eased);
      eased.value = value;
      apply(value);
    },
    update(value) {
      gsap.to(eased, {
        value,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => apply(eased.value),
      });
    },
    kill() {
      gsap.killTweensOf(eased);
    },
  };
}

/**
 * Scroll-drives the Crossfire sequence with the site's existing GSAP
 * ScrollTrigger (no new scroll listener).
 *
 * - Desktop: the section is pinned and one master progress (0–1) runs the
 *   intro, the three pairs in turn, then the result.
 * - Tablet / mobile / short screens: nothing is pinned; each pair, the intro
 *   and the result follow their own position in the viewport instead.
 * - Reduced motion: no triggers — the finished, resolved state is shown.
 *
 * Progress is written as CSS custom properties + `data-state` (nothing
 * re-renders in React while scrolling) and as plain numbers for the WebGL
 * test point in `instrumentRef`. All of it is derived from progress, so it
 * reverses exactly when the visitor scrolls back up.
 */
export function useCrossfireSequence({ sectionRef, arenaRef, pairs, instrumentRef, layoutRef, reducedMotion }) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const arena = arenaRef.current;
    if (!section || !arena) return undefined;

    const pairEls = Array.from(arena.querySelectorAll("[data-cf-pair]"));
    const slotEls = pairEls.map((el) => el.querySelector("[data-cf-slot]"));
    const homeEl = arena.querySelector("[data-cf-home]");
    const resultEl = section.querySelector("[data-cf-result]");
    const stageEl = section.querySelector("[data-cf-stage]");
    const count = pairEls.length;
    const instrument = instrumentRef.current;

    // Where the desk should sit on screen, relative to the section (the canvases cover it)
    const measure = () => {
      const a = section.getBoundingClientRect();
      const st = stageEl.getBoundingClientRect();

      const centre = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
      };

      // Free space between the two columns of exhibits, so the desk at rest never touches one
      // (allowing for the small shift each exhibit makes toward the centre).
      let leftEdge = -Infinity;
      let rightEdge = Infinity;
      arena.querySelectorAll(".cf-exhibit").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (el.classList.contains("cf-exhibit--your")) leftEdge = Math.max(leftEdge, r.right);
        else rightEdge = Math.min(rightEdge, r.left);
      });
      const gap = rightEdge - leftEdge;
      const stacked = window.matchMedia("(max-width: 640px)").matches;
      const fromStage = Math.min(st.width / 1.1, st.height * 2.9);
      // the resting arrangement (book + two files) is ~0.81 m wide; perspective and yaw add ~20%
      const fromGap = Number.isFinite(gap) && gap > 0 ? (gap - 110) / 1.02 : fromStage;

      layoutRef.current = {
        w: a.width,
        h: a.height,
        home: centre(homeEl),
        slots: slotEls.map(centre),
        stage: {
          x: !stacked && Number.isFinite(gap) && gap > 0 ? (leftEdge + rightEdge) / 2 - a.left : st.left - a.left + st.width / 2,
          y: st.top - a.top + st.height * 0.46,
          w: st.width,
          h: st.height,
          // px per metre at the desk: fit the gap on desktop; on narrow layouts let the desk sit behind the text
          scale: Math.max(80, stacked ? fromStage : Math.min(st.height * 2.9, Math.max(fromGap, fromStage * 0.5))),
        },
      };
      instrument.invalidate?.();
      instrument.invalidateBackdrop?.();
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(section);
    observer?.observe(arena);
    observer?.observe(stageEl);
    pairEls.forEach((el) => observer?.observe(el));

    const values = { intro: 0, pairs: new Array(count).fill(0), result: 0 };

    const render = () => {
      arena.style.setProperty("--intro", fmt(values.intro));
      if (resultEl) resultEl.style.setProperty("--result", fmt(values.result));

      const sum = values.pairs.reduce((a, b) => a + b, 0);
      const pos = reducedMotion ? -1 : instrumentPosition(sum, count);

      let meet = 0;
      let turns = 0;
      let tone = 0;
      let claimAdv = 0;
      let objAdv = 0;
      let unresolved = 0;

      pairEls.forEach((el, i) => {
        const pair = pairs[i];
        const p = values.pairs[i];
        const ph = pairPhases(p, pair.tempo, pair.status);

        // Only one pair is active at a time: it rises as it starts and hands over as the next begins
        const next = values.pairs[i + 1] ?? 0;
        const active = smooth(seg(p, 0, 0.12)) * (i < count - 1 ? 1 - smooth(seg(next, 0, 0.12)) : 1);
        const engaged = 0.4 + 0.6 * active; // an exhibit that has been tested settles part-way back
        const stopsShort = pair.status === "unresolved" ? 1 - 0.5 * ph.settle : 1; // the evidence gap

        el.style.setProperty("--active", fmt(active));
        el.style.setProperty("--claim-adv", fmt(ph.claimFill * engaged));
        el.style.setProperty("--obj-adv", fmt(ph.objTravel * engaged * stopsShort));
        el.style.setProperty("--settle", fmt(ph.settle));
        if (el.dataset.state !== ph.state) el.dataset.state = ph.state;

        // The test point rests on this row until the next pair begins
        const presence = reducedMotion ? 0 : clamp01(1 - Math.abs(pos - i) / 0.5);
        claimAdv += ph.claimFill / count;
        objAdv += ph.objTravel / count;
        turns += ph.lock;
        if (pair.status === "unresolved") {
          unresolved = Math.max(unresolved, ph.settle);
          tone = Math.max(tone, ph.lock * presence);
        }
        meet = Math.max(meet, ph.meet);
      });

      section.style.setProperty("--stage", fmt(smooth(seg(values.intro, 0, 0.6))));

      instrument.reduced = reducedMotion;
      instrument.pos = pos;
      instrument.appear = smooth(seg(values.intro, 0.4, 1));
      instrument.turns = turns;
      instrument.tone = tone;
      instrument.claimAdv = claimAdv;
      instrument.objAdv = objAdv;
      instrument.unresolved = unresolved;
      instrument.sumNorm = sum / count;
      instrument.meet = meet;
      instrument.invalidate?.();
      instrument.invalidateBackdrop?.();
    };

    let cleanup = () => {};

    if (reducedMotion) {
      values.intro = 1;
      values.pairs.fill(1);
      values.result = 1;
      render();
    } else {
      registerGsap();
      render();

      const mm = gsap.matchMedia();
      mm.add({ pinned: PINNED_QUERY, flow: FLOW_QUERY }, (context) => {
        const drivers = [];

        if (context.conditions.pinned) {
          const driver = easedDriver((progress) => {
            const local = masterToLocal(progress, count);
            values.intro = local.intro;
            values.result = local.result;
            local.pairs.forEach((p, i) => {
              values.pairs[i] = p;
            });
            render();
          });
          drivers.push(driver);

          ScrollTrigger.create({
            trigger: section,
            start: "top top+=72",
            end: () => "+=" + Math.round(window.innerHeight * 3),
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => driver.set(self.progress),
            onUpdate: (self) => driver.update(self.progress),
          });
        } else {
          const track = (trigger, start, end, write) => {
            const driver = easedDriver((progress) => {
              write(progress);
              render();
            });
            drivers.push(driver);
            ScrollTrigger.create({
              trigger,
              start,
              end,
              onRefresh: (self) => driver.set(self.progress),
              onUpdate: (self) => driver.update(self.progress),
            });
          };

          track(arena, "top 88%", "top 62%", (p) => {
            values.intro = p;
          });
          pairEls.forEach((el, i) => {
            track(el, "top 86%", "top 42%", (p) => {
              values.pairs[i] = p;
            });
          });
          if (resultEl) {
            track(resultEl, "top 94%", "top 78%", (p) => {
              values.result = p;
            });
          }
        }

        return () => drivers.forEach((d) => d.kill());
      });

      cleanup = () => mm.revert();
    }

    return () => {
      cleanup();
      observer?.disconnect();
    };
  }, [sectionRef, arenaRef, pairs, instrumentRef, layoutRef, reducedMotion]);
}
