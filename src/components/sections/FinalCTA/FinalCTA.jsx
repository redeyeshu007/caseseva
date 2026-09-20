import { useRef, useState } from "react";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";
import "./FinalCTA.css";

/**
 * Act XII — Final CTA.
 * Single-line system font headline and Navbar-style pill CTA button.
 */
function FinalCTA() {
  const headlineRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  useEditorialReveal(headlineRef, { start: "top 90%" });

  return (
    <section id="final-cta" className="final-cta section" data-bg="#ffffff">
      <div className="container final-cta__content">
        <h2 ref={headlineRef} className="final-cta__headline">
          Your case deserves a team. Right now it has a folder.
        </h2>
        <a
          href="#cases-go-cold"
          className="javix-navbar-cta final-cta__navbar-btn"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span>{isHovered ? "Explore" : "Open Your Case"}</span>
          <svg
            className={`javix-navbar-cta-icon ${isHovered ? "icon-hovered" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isHovered ? (
              <>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </>
            ) : (
              <>
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </>
            )}
          </svg>
        </a>
      </div>
      <div className="final-cta__visual" aria-hidden="true" />
    </section>
  );
}

export default FinalCTA;
