import { useEffect } from "react";
import { gsap, ScrollTrigger, registerGsap } from "./gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Splits the text content of `ref` into word-level spans and reveals
 * them with a staggered blur-to-sharp, translate + opacity animation
 * as the element scrolls into view. Used for editorial headlines
 * throughout the acts.
 *
 * Meaning: the words resolve because the visitor is being told
 * something — the animation exists to introduce information, not to
 * decorate the page.
 */
export function useEditorialReveal(ref, { start = "top 82%", once = true } = {}) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    registerGsap();

    const originalHTML = node.innerHTML;
    const originalChildren = Array.from(node.childNodes);
    node.innerHTML = "";
    const spans = [];

    const appendWords = (text, container = node) => {
      const words = text.split(/(\s+)/).filter((w) => w.length);
      words.forEach((word) => {
        if (/^\s+$/.test(word)) {
          container.appendChild(document.createTextNode(word));
          return;
        }
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity, filter";
        container.appendChild(span);
        container.appendChild(document.createTextNode(" "));
        spans.push(span);
      });
    };

    // Walk the original child nodes so structural elements — <br>
    // above all, used for intentional line breaks in headlines — are
    // preserved instead of being flattened away by reading
    // node.textContent directly.
    originalChildren.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        appendWords(child.textContent);
      } else if (child.nodeName === "BR") {
        node.appendChild(document.createElement("br"));
      } else {
        // Keep wrapper elements (e.g. a per-line <span> carrying its
        // own weight) and split the words inside a shallow clone.
        const wrapper = child.cloneNode(false);
        node.appendChild(wrapper);
        appendWords(child.textContent, wrapper);
      }
    });

    let trigger;

    if (reducedMotion) {
      gsap.set(spans, { opacity: 1, y: 0, filter: "blur(0px)" });
    } else {
      gsap.set(spans, { opacity: 0, y: "0.5em", filter: "blur(8px)" });
      trigger = ScrollTrigger.create({
        trigger: node,
        start,
        once,
        onEnter: () =>
          gsap.to(spans, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.045,
          }),
      });
    }

    return () => {
      trigger?.kill();
      node.innerHTML = originalHTML;
    };
  }, [ref, start, once, reducedMotion]);
}
