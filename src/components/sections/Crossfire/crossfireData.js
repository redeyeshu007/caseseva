/**
 * The argument pairs tested in Crossfire. Add a pair here and the arena, the
 * sequence timeline, the test point and the result line all pick it up.
 *
 * yourCategory / otherCategory: short descriptive labels only (no new claims)
 * yourStatus / otherStatus: the small document metadata on each exhibit
 * status: "tested"     — the objection was answered (brass)
 *         "unresolved" — the objection is still open (oxblood)
 * tempo (optional): per-pair overrides of DEFAULT_TEMPO in crossfireTimeline.js,
 *         so the pairs share one system but do not move identically.
 */
export const crossfirePairs = [
  {
    id: "01",
    yourSide: "The goods failed within four days of delivery.",
    yourCategory: "Product defect",
    yourStatus: "Verified",
    otherSide: "The buyer may have caused the fault.",
    otherCategory: "Causation",
    otherStatus: "Challenge",
    status: "tested",
  },
  {
    id: "02",
    yourSide: "The invoice and payment proof match the claim exactly.",
    yourCategory: "Payment proof",
    yourStatus: "Verified",
    otherSide: "The policy may permit repair before replacement.",
    otherCategory: "Repair policy",
    otherStatus: "Challenge",
    status: "tested",
    tempo: {
      claimTravel: [0.1, 0.56],
      objIn: [0.22, 0.4],
      objTravel: [0.34, 0.58],
      meet: [0.56, 0.8],
      settle: [0.72, 0.93],
    },
  },
  {
    id: "03",
    yourSide: "The defect was reported to support in writing.",
    yourCategory: "Written complaint",
    yourStatus: "Verified",
    otherSide: "No independent inspection has confirmed the defect.",
    otherCategory: "Inspection",
    otherStatus: "Unresolved",
    status: "unresolved",
    tempo: {
      claimTravel: [0.08, 0.62],
      objIn: [0.24, 0.42],
      objTravel: [0.36, 0.66],
      meet: [0.62, 0.84],
      settle: [0.78, 0.96],
    },
  },
];

export const CROSSFIRE_EYEBROW = "The case is tested before anyone else sees it";
export const CROSSFIRE_HEADLINE =
  "Every argument meets its objection before it leaves the building.";
export const CROSSFIRE_DISCLAIMER = "No outcome is predicted.";
