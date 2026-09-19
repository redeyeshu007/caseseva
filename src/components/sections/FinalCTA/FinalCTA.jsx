import { useRef } from "react";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";
import "./FinalCTA.css";

/**
 * Act XII — Let the Weighing Begin. The conclusion of the journey:
 * large negative space, one headline, one action. The reserved
 * Justice visual can return here later — left blank for now.
 */
function FinalCTA() {
  const headlineRef = useRef(null);
  useEditorialReveal(headlineRef, { start: "top 90%" });

  return (
    <section id="final-cta" className="final-cta section" data-bg="#ffffff">
      <div className="container final-cta__content">
        <h2 ref={headlineRef} className="final-cta__headline">
          Your case deserves a team.
          <br />
          Right now it has a folder.
        </h2>
        <a href="#telling" className="final-cta__button">
          Tell It Once
        </a>
      </div>
      <div className="final-cta__visual" aria-hidden="true" />
    </section>
  );
}

export default FinalCTA;
