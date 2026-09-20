import ScrollVelocity from "../../ui/ScrollVelocity/ScrollVelocity";
import "./Boundaries.css";

const BOUNDARY_TEXTS = [
  "WE WILL NOT APPEAR FOR YOU —",
  "WE WILL NOT PROMISE A RESULT —",
  "WE WILL NOT INVENT LAW —",
  "WE WILL NOT SKIP THE ADVOCATE —",
];

/**
 * Act XI — Standing / What We Will Not Do.
 * Powered by dynamic Motion velocity scroll ticker:
 * 4 separate alternating velocity lines, framed by crisp black boundary lines above and below.
 */
function Boundaries() {
  return (
    <section id="standing" className="boundaries section on-dark" data-bg="#000000">
      {/* Centered Editorial Header */}
      <div className="container boundaries__header-container">
        <header className="boundaries__header">
          <p className="eyebrow on-dark boundaries__eyebrow">Our Mandate</p>
          <h2 className="boundaries__headline">What We Will Not Do</h2>
          <p className="boundaries__subhead">
            Four non-negotiable legal boundaries. Fixed before anything begins.
          </p>
        </header>
      </div>

      {/* Velocity Ticker with Line for Each Statement */}
      <div className="boundaries__track-wrapper">
        <ScrollVelocity
          texts={BOUNDARY_TEXTS}
          velocity={70}
          className="boundaries__scroll-text"
          numCopies={6}
          damping={50}
          stiffness={400}
        />
      </div>
    </section>
  );
}

export default Boundaries;
