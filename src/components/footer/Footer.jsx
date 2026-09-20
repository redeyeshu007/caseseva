import { useRef, useEffect } from "react";
import { registerGsap, gsap } from "../../animations/gsapSetup";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./Footer.css";

/**
 * CASESEVA Footer — Minimal White Section with Giant Logo.
 * Features:
 * - Pure white #ffffff background
 * - Dominant, giant official CASESEVA logo
 * - Subtle entrance reveal on scroll
 * - Crisp black text for copyright and developer credits
 * - Refined green technological signal interaction on "Green Sync Innovators."
 */
function Footer() {
  const footerRef = useRef(null);
  const logoRef = useRef(null);
  const bottomRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const footer = footerRef.current;
    const logo = logoRef.current;
    const bottom = bottomRef.current;
    if (!footer || !logo) return undefined;

    registerGsap();

    if (reducedMotion) {
      gsap.set([logo, bottom], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(logo, { opacity: 0, y: 30 });
    if (bottom) gsap.set(bottom, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    tl.to(logo, {
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
      className="footer on-light"
      data-bg="#ffffff"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="footer__logo-wrap">
        <img
          ref={logoRef}
          src="/logo.png"
          alt="CASESEVA"
          className="footer__giant-logo"
        />
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
