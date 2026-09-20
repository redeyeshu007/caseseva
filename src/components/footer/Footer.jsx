import "./Footer.css";

const COLUMNS = [
  {
    title: "The Building",
    links: ["Threshold", "The Assembly", "Crossfire", "The Ledger", "The Compass"],
  },
  {
    title: "For Counsel",
    links: ["Robes", "Take the Robe", "Verification Standard", "Advocate Terms"],
  },
  {
    title: "Standing",
    links: ["Our Mandate", "Boundaries", "Sources of Law", "Case Notes"],
  },
  {
    title: "The Registry",
    links: ["Reach a Human", "Grievance Officer", "Press", "Partnerships"],
  },
  {
    title: "Instruments",
    links: ["Privacy", "Terms of Seva", "Data Handling", "Doubts Raised"],
  },
];

function Footer() {
  return (
    <footer className="footer" data-bg="#ffffff">
      <div className="container footer__grid">
        <div className="footer__mark">
          <span className="footer__wordmark">CASESEVA</span>
          <p className="footer__note">
            AI-assisted, advocate-reviewed. Not a judgment. Not a guarantee of
            outcome.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} className="footer__column" aria-label={column.title}>
            <span className="footer__column-title">{column.title}</span>
            <ul>
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#threshold">{link}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} CaseSeva</span>
        <span>A record is kept, not invented.</span>
      </div>
    </footer>
  );
}

export default Footer;
