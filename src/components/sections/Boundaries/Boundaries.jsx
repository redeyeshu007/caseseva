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
 * Features the interactive FlowingMenu with pure black & white aesthetic,
 * system sans-serif typography, and black-and-white legal imagery.
 */
function Boundaries() {
  return (
    <section id="standing" className="boundaries section on-dark" data-bg="#000000">
      <div className="boundaries__header">
        <p className="eyebrow boundaries__eyebrow">Ethical Standing</p>
        <h2 className="boundaries__headline">
          Defined by what we <span className="boundaries__headline-accent">will not do.</span>
        </h2>
        <p className="boundaries__subhead">
          Four non-negotiable boundaries that protect every case before it is filed.
        </p>
      </div>

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
    </section>
  );
}

export default Boundaries;
