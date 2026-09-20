import { useRef, useEffect } from "react";
import { registerGsap, gsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import FlowingMenu from "./FlowingMenu";
import "./Boundaries.css";

const STANDING_ITEMS = [
  {
    link: "#standing",
    text: "We will not appear for you",
    image: "/images/standing/appear.jpg",
  },
  {
    link: "#standing",
    text: "We will not promise a result",
    image: "/images/standing/promise.jpg",
  },
  {
    link: "#standing",
    text: "We will not invent law",
    image: "/images/standing/invent.jpg",
  },
  {
    link: "#standing",
    text: "We will not skip the advocate",
    image: "/images/standing/advocate.jpg",
  },
];

/**
 * Act XI — Standing (What We Will Not Do).
 * Features the exact editorial typography from the Robes section:
 * Cormorant Garamond serif title, Inter eyebrow & subtitle,
 * paired with the interactive FlowingMenu.
 * Pinned scroll-driven reveal reveals each boundary one by one with scroll progression.
 */
function Boundaries() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    registerGsap();

    const header = headerRef.current;
    const items = Array.from(section.querySelectorAll(".menu__item"));

    if (reducedMotion) {
      if (header) gsap.set(header, { opacity: 1, y: 0 });
      if (items.length) gsap.set(items, { opacity: 1, y: 0, filter: "blur(0px)" });
      return undefined;
    }

    const mm = gsap.matchMedia();

    // Desktop: Pinned scrub reveal one-by-one with scroll
    mm.add("(min-width: 769px)", () => {
      if (header) gsap.set(header, { opacity: 0, y: 25 });
      if (items.length) gsap.set(items, { opacity: 0, y: 35, filter: "blur(8px)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      if (header) {
        tl.to(header, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
          .to({}, { duration: 0.4 });
      }

      items.forEach((item, index) => {
        tl.to(item, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
        });
        if (index < items.length - 1) {
          tl.to({}, { duration: 0.4 }); // Pause between boundary rows
        } else {
          tl.to({}, { duration: 0.5 }); // Final pause with all boundaries resting
        }
      });
    });

    // Mobile: Sequential reveal as you scroll down
    mm.add("(max-width: 768px)", () => {
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
              trigger: header,
              start: "top 80%",
            },
          }
        );
      }

      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 30, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
            },
          }
        );
      });
    });

    return () => {
      mm.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      id="standing"
      ref={sectionRef}
      className="boundaries section on-dark"
      data-bg="#000000"
      aria-label="Standing — What We Will Not Do"
    >
      <div className="container">
        {/* Editorial Header matching Robes typography */}
        <div ref={headerRef} className="boundaries__header">
          <div className="boundaries__eyebrow">Ethical Standing</div>
          <h2 className="boundaries__title">
            Defined by what we{" "}
            <span className="boundaries__title-highlight">
              will not do.
            </span>
          </h2>
          <p className="boundaries__subtitle">
            Four non-negotiable boundaries that protect every case before it is filed.
          </p>
        </div>

        {/* Interactive FlowingMenu */}
        <div className="boundaries__menu-container">
          <FlowingMenu
            items={STANDING_ITEMS}
            speed={15}
            textColor="#ffffff"
            bgColor="#000000"
            marqueeBgColor="#ffffff"
            marqueeTextColor="#000000"
            borderColor="rgba(255, 255, 255, 0.15)"
          />
        </div>
      </div>
    </section>
  );
}

export default Boundaries;
