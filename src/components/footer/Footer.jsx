import { useRef, useEffect } from "react";
import { registerGsap, gsap } from "../../animations/gsapSetup";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./Footer.css";

/**
 * CASESEVA Footer — Cinematic Minimal Black Statement.
 * Features:
 * - Pure black #000000 background
 * - Dominant, giant CASESEVA typographic object
 * - Subtle entrance reveal on scroll
 * - Strict black & white color palette
 * - Refined green technological signal interaction on "Green Sync Innovators."
 */
function Footer() {
  const footerRef = useRef(null);
  const wordmarkRef = useRef(null);
  const bottomRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const footer = footerRef.current;
    const wordmark = wordmarkRef.current;
    const bottom = bottomRef.current;
    if (!footer || !wordmark) return undefined;

    registerGsap();

    if (reducedMotion) {
      gsap.set([wordmark, bottom], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(wordmark, { opacity: 0, y: 30 });
    if (bottom) gsap.set(bottom, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    tl.to(wordmark, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power2.out",
    }).to(
      bottom,
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.5"
    );

    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="footer on-dark"
      data-bg="#000000"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="footer__wordmark-wrap">
        <h2 ref={wordmarkRef} className="footer__giant-wordmark">
          CASESEVA
        </h2>
      </div>

      <div className="footer__bottom-wrap">
        <div ref={bottomRef} className="footer__bottom">
          <p className="footer__copyright">
            © 2026 CASESEVA. All rights reserved.
          </p>

          <div className="footer__credit">
            <span className="footer__credit-prefix">Design and Developed by</span>{" "}
            <a
              href="https://greensyncinnovators.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__dev-link"
              aria-label="Green Sync Innovators (opens in a new tab)"
            >
              <span className="footer__dev-name">Green Sync Innovators.</span>
              <span className="footer__dev-track" aria-hidden="true">
                <span className="footer__dev-line" />
                <span className="footer__dev-spark" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
