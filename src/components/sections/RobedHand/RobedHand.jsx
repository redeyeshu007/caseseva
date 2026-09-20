import { useState, useRef, useEffect } from "react";
import { registerGsap, gsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./RobedHand.css";

const ACTIONS = [
  {
    id: "strike",
    num: "01",
    title: "STRIKE A GROUND",
    desc: "Remove a legal allegation the evidence does not justify.",
    position: "top-left",
    ringLabel: "CLARIFY",
    nodeAngle: 315,
    arcStart: 282,
    arcEnd: 348,
    nodePos: { x: 235, y: 235 },
    connector: { x1: 235, y1: 235, x2: 165, y2: 165, x3: 120, y3: 165 },
  },
  {
    id: "correct",
    num: "02",
    title: "CORRECT THE RECORD",
    desc: "Fix a fact, a date, or an amount.",
    position: "top-right",
    ringLabel: "VERIFY",
    nodeAngle: 45,
    arcStart: 12,
    arcEnd: 78,
    nodePos: { x: 645, y: 235 },
    connector: { x1: 645, y1: 235, x2: 715, y2: 165, x3: 760, y3: 165 },
  },
  {
    id: "demand",
    num: "03",
    title: "DEMAND A DOCUMENT",
    desc: "Send the case back to the client for proof.",
    position: "bottom-left",
    ringLabel: "STRENGTHEN",
    nodeAngle: 225,
    arcStart: 192,
    arcEnd: 258,
    nodePos: { x: 235, y: 645 },
    connector: { x1: 235, y1: 645, x2: 165, y2: 715, x3: 120, y3: 715 },
  },
  {
    id: "reopen",
    num: "04",
    title: "RE-OPEN THE ANALYSIS",
    desc: "Trigger a focused re-run of only affected analysis.",
    position: "bottom-right",
    ringLabel: "REASSESS",
    nodeAngle: 135,
    arcStart: 102,
    arcEnd: 168,
    nodePos: { x: 645, y: 645 },
    connector: { x1: 645, y1: 645, x2: 715, y2: 715, x3: 760, y3: 715 },
  },
];

// Generates clock-based polar coordinates (0 deg is 12 o'clock / North)
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Generates SVG arc path
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
  ].join(" ");
}

/**
 * Act IX — The Robed Hand / Decision Wheel.
 * Full-viewport interactive circular decision mechanism representing
 * the human advocate layer of CaseSeva.
 */
function RobedHand() {
  const [activeAction, setActiveAction] = useState(null);
  const sectionRef = useRef(null);
  const wheelRef = useRef(null);
  const outerRingRef = useRef(null);
  const centerCircleRef = useRef(null);
  const nodesRef = useRef([]);
  const actionsRef = useRef([]);
  const centerContentRef = useRef(null);
  const reducedMotion = useReducedMotion();

  // Scroll reveal animation sequence
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    registerGsap();

    const nodes = nodesRef.current.filter(Boolean);
    const actions = actionsRef.current.filter(Boolean);

    if (reducedMotion) {
      gsap.set(
        [
          wheelRef.current,
          outerRingRef.current,
          centerCircleRef.current,
          nodes,
          actions,
          centerContentRef.current,
        ],
        { opacity: 1, scale: 1, y: 0 }
      );
      return undefined;
    }

    // Prepare initial hidden states
    gsap.set(wheelRef.current, { opacity: 0, scale: 0.94 });
    gsap.set(outerRingRef.current, { opacity: 0 });
    gsap.set(centerCircleRef.current, { opacity: 0, scale: 0.92 });
    gsap.set(nodes, { opacity: 0, scale: 0 });
    gsap.set(actions, { opacity: 0, y: 16 });
    gsap.set(centerContentRef.current, { opacity: 0, y: 12 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });

    // 1. Circular wheel slowly reveals itself
    tl.to(wheelRef.current, {
      opacity: 1,
      scale: 1,
      duration: 1.0,
      ease: "power2.out",
    })
      // 2. Outer ring fades in
      .to(
        outerRingRef.current,
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5"
      )
      // 3. Central circle appears
      .to(
        centerCircleRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      )
      // 4. Four brass nodes appear sequentially
      .to(
        nodes,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "back.out(2)",
        },
        "-=0.3"
      )
      // 5. Four action labels reveal around the wheel
      .to(
        actions,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.2"
      )
      // 6. Center headline reveals last
      .to(
        centerContentRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
        },
        "-=0.2"
      );

    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  // Dial tick marks (every 15 degrees)
  const dialTicks = Array.from({ length: 24 }, (_, i) => {
    const angle = i * 15;
    const isMajor = angle % 45 === 0;
    const innerR = isMajor ? 372 : 376;
    const outerR = 382;
    const p1 = polarToCartesian(440, 440, innerR, angle);
    const p2 = polarToCartesian(440, 440, outerR, angle);
    return { key: i, p1, p2, isMajor };
  });

  return (
    <section
      id="robes"
      ref={sectionRef}
      className="robes-section section"
      data-bg="#ffffff"
      aria-label="The Robed Hand — Human Advocate Judgment"
    >
      <div className="robes-container">
        {/* Main Circular Decision Wheel Stage */}
        <div ref={wheelRef} className="robes-wheel">
          {/* SVG Geometry Layer */}
          <svg
            className="robes-wheel__svg"
            viewBox="0 0 880 880"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Defs for subtle glows */}
            <defs>
              <filter id="brass-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subtle outermost boundary rings */}
            <circle
              cx="440"
              cy="440"
              r="426"
              className="robes-geo-ring robes-geo-ring--outermost"
            />
            <circle
              cx="440"
              cy="440"
              r="406"
              strokeDasharray="2 6"
              className="robes-geo-ring robes-geo-ring--dashed"
            />

            {/* Dial Ticks Ring */}
            <g className="robes-geo-ticks">
              {dialTicks.map(({ key, p1, p2, isMajor }) => (
                <line
                  key={key}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={isMajor ? "robes-tick--major" : "robes-tick--minor"}
                />
              ))}
            </g>

            {/* Outer Ring & Axis Metadata */}
            <g ref={outerRingRef} className="robes-geo-outer">
              {/* Vertical Cardinal Axis */}
              <line x1="440" y1="42" x2="440" y2="252" className="robes-geo-axis" />
              <line x1="440" y1="628" x2="440" y2="838" className="robes-geo-axis" />

              {/* Horizontal Secondary Axis */}
              <line x1="42" y1="440" x2="252" y2="440" className="robes-geo-axis-subtle" />
              <line x1="628" y1="440" x2="838" y2="440" className="robes-geo-axis-subtle" />

              {/* Primary Cardinal Labels: HUMAN (top) and JUSTICE (bottom) */}
              <text x="440" y="32" className="robes-cardinal-label robes-cardinal-label--top">
                HUMAN
              </text>
              <text x="440" y="858" className="robes-cardinal-label robes-cardinal-label--bottom">
                JUSTICE
              </text>

              {/* Secondary Quadrant Words along the outer ring */}
              <text x="210" y="98" className="robes-quadrant-word">
                CLARIFY
              </text>
              <text x="670" y="98" className="robes-quadrant-word">
                VERIFY
              </text>
              <text x="200" y="796" className="robes-quadrant-word">
                STRENGTHEN
              </text>
              <text x="680" y="796" className="robes-quadrant-word">
                REASSESS
              </text>
            </g>

            {/* Middle Action Orbit Ring */}
            <circle
              cx="440"
              cy="440"
              r="290"
              className="robes-geo-ring robes-geo-ring--middle"
            />

            {/* Four Interactive Quadrant Highlight Arcs (r = 290) */}
            {ACTIONS.map((action) => {
              const isActive = activeAction === action.id;
              const arcD = describeArc(440, 440, 290, action.arcStart, action.arcEnd);
              return (
                <path
                  key={`arc-${action.id}`}
                  d={arcD}
                  className={`robes-quadrant-arc ${
                    isActive ? "robes-quadrant-arc--active" : ""
                  }`}
                />
              );
            })}

            {/* Connectors & Brass Nodes for the 4 Positions */}
            {ACTIONS.map((action, idx) => {
              const isActive = activeAction === action.id;
              const { connector, nodePos } = action;
              return (
                <g
                  key={`node-group-${action.id}`}
                  ref={(el) => (nodesRef.current[idx] = el)}
                  className={`robes-node-group ${
                    isActive ? "robes-node-group--active" : ""
                  }`}
                  onMouseEnter={() => setActiveAction(action.id)}
                  onMouseLeave={() => setActiveAction(null)}
                >
                  {/* Subtle Connecting Geometry */}
                  <path
                    d={`M ${connector.x1} ${connector.y1} L ${connector.x2} ${connector.y2} L ${connector.x3} ${connector.y3}`}
                    className={`robes-connector-line ${
                      isActive ? "robes-connector-line--active" : ""
                    }`}
                  />

                  {/* Brass Node Halo */}
                  <circle
                    cx={nodePos.x}
                    cy={nodePos.y}
                    r={isActive ? 15 : 12}
                    className={`robes-node-halo ${
                      isActive ? "robes-node-halo--active" : ""
                    }`}
                  />

                  {/* Solid Brass Core Pip */}
                  <circle
                    cx={nodePos.x}
                    cy={nodePos.y}
                    r={isActive ? 6 : 4.5}
                    className={`robes-node-core ${
                      isActive ? "robes-node-core--active" : ""
                    }`}
                  />
                </g>
              );
            })}

            {/* Inner Boundary Rings (enclosing the Center) */}
            <circle
              cx="440"
              cy="440"
              r="188"
              className="robes-geo-ring robes-geo-ring--inner"
            />
            <circle
              cx="440"
              cy="440"
              r="182"
              className="robes-geo-ring robes-geo-ring--innermost"
            />
          </svg>

          {/* Central Decision Authority Core */}
          <div ref={centerCircleRef} className="robes-center">
            <div ref={centerContentRef} className="robes-center__content">
              <span className="robes-center__eyebrow">THE HUMAN WORD, LAST</span>

              <h2 className="robes-center__headline">
                <span className="robes-center__headline-ai">AI prepares.</span>
                <span className="robes-center__headline-human">An advocate decides.</span>
              </h2>

              <div className="robes-center__divider" aria-hidden="true" />

              <div className="robes-center__sub">
                <span className="robes-center__sub-line">TECHNOLOGY ASSISTS.</span>
                <span className="robes-center__sub-line">HUMAN JUDGMENT PREVAILS.</span>
              </div>
            </div>
          </div>

          {/* The Four Action Labels Positioned Around the Circle (Desktop) */}
          <div className="robes-actions-orbit">
            {ACTIONS.map((action, idx) => {
              const isActive = activeAction === action.id;
              const isMuted = activeAction !== null && !isActive;

              return (
                <div
                  key={action.id}
                  ref={(el) => (actionsRef.current[idx] = el)}
                  className={`robes-action robes-action--${action.position} ${
                    isActive ? "robes-action--active" : ""
                  } ${isMuted ? "robes-action--muted" : ""}`}
                  onMouseEnter={() => setActiveAction(action.id)}
                  onMouseLeave={() => setActiveAction(null)}
                  role="region"
                  aria-label={`${action.num} ${action.title}`}
                >
                  <div className="robes-action__header">
                    <span className="robes-action__num">{action.num}</span>
                    <span className="robes-action__meta-dot" aria-hidden="true" />
                    <span className="robes-action__ring-label">{action.ringLabel}</span>
                  </div>

                  <h3 className="robes-action__title">{action.title}</h3>
                  <p className="robes-action__desc">{action.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Responsive Mobile Layout (Center Emblem + Stacked Pairs 01/02 and 03/04) */}
        <div className="robes-mobile-flow">
          <div className="robes-mobile-center">
            <div className="robes-mobile-center__ring">
              <span className="robes-center__eyebrow">THE HUMAN WORD, LAST</span>
              <h2 className="robes-center__headline">
                <span className="robes-center__headline-ai">AI prepares.</span>
                <span className="robes-center__headline-human">An advocate decides.</span>
              </h2>
              <div className="robes-center__divider" aria-hidden="true" />
              <div className="robes-center__sub">
                <span className="robes-center__sub-line">TECHNOLOGY ASSISTS.</span>
                <span className="robes-center__sub-line">HUMAN JUDGMENT PREVAILS.</span>
              </div>
            </div>
          </div>

          {/* Mobile Axis Divider */}
          <div className="robes-mobile-axis" aria-hidden="true">
            <span className="robes-mobile-axis-tag">HUMAN</span>
            <div className="robes-mobile-axis-line" />
            <span className="robes-mobile-axis-tag">JUSTICE</span>
          </div>

          {/* Mobile Actions Grid: 01/02 then 03/04 */}
          <div className="robes-mobile-actions">
            <div className="robes-mobile-actions__row">
              {ACTIONS.slice(0, 2).map((action) => {
                const isActive = activeAction === action.id;
                const isMuted = activeAction !== null && !isActive;
                return (
                  <div
                    key={action.id}
                    className={`robes-mobile-action ${
                      isActive ? "robes-mobile-action--active" : ""
                    } ${isMuted ? "robes-mobile-action--muted" : ""}`}
                    onClick={() =>
                      setActiveAction(activeAction === action.id ? null : action.id)
                    }
                  >
                    <div className="robes-action__header">
                      <span className="robes-action__num">{action.num}</span>
                      <span className="robes-action__ring-label">{action.ringLabel}</span>
                    </div>
                    <h3 className="robes-action__title">{action.title}</h3>
                    <p className="robes-action__desc">{action.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="robes-mobile-actions__row">
              {ACTIONS.slice(2, 4).map((action) => {
                const isActive = activeAction === action.id;
                const isMuted = activeAction !== null && !isActive;
                return (
                  <div
                    key={action.id}
                    className={`robes-mobile-action ${
                      isActive ? "robes-mobile-action--active" : ""
                    } ${isMuted ? "robes-mobile-action--muted" : ""}`}
                    onClick={() =>
                      setActiveAction(activeAction === action.id ? null : action.id)
                    }
                  >
                    <div className="robes-action__header">
                      <span className="robes-action__num">{action.num}</span>
                      <span className="robes-action__ring-label">{action.ringLabel}</span>
                    </div>
                    <h3 className="robes-action__title">{action.title}</h3>
                    <p className="robes-action__desc">{action.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RobedHand;
