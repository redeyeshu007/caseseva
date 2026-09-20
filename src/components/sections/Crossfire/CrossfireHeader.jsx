import { CROSSFIRE_EYEBROW, CROSSFIRE_HEADLINE } from "./crossfireData";

function CrossfireHeader() {
  return (
    <header className="cf-header">
      <p className="cf-eyebrow">{CROSSFIRE_EYEBROW}</p>
      <h2 className="cf-headline">{CROSSFIRE_HEADLINE}</h2>
    </header>
  );
}

export default CrossfireHeader;
