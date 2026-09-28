import summary from "@/data/summary.json";
import { compact, int, pct } from "@/lib/format";

const s = summary[0];

/** Roughens the stamp edge and knocks out a few specks, like ink on paper. */
function InkFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <filter id="stamp-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 5.75" result="speck" />
          <feComposite in="SourceGraphic" in2="speck" operator="in" result="specked" />
          <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="1" seed="3" result="warp" />
          <feDisplacementMap in="specked" in2="warp" scale="3.2" />
        </filter>
      </defs>
    </svg>
  );
}

export function Hero() {
  const certifiedShare = s.certified_status / s.cases;
  return (
    <header className="hero">
      <InkFilter />
      <h1 className="hero-title">
        <span>What the H-1B</span>
        <span>paperwork says</span>
      </h1>
      <div className="stamp" role="img" aria-label={`Certified status on ${pct(certifiedShare)} of cases`}>
        <span className="stamp-word">CERTIFIED</span>
        <span className="stamp-note">{pct(certifiedShare)} of cases on file</span>
      </div>
      <p className="hero-dek">
        The Department of Labor publishes every H-1B application and green-card labor certification case it decides. This page charts{" "}
        {compact(s.cases)} of them from {s.first_year} to {s.last_year}: how many, what they pay, where the work is, and who files.
      </p>
      <p className="hero-read">
        Each green stripe is a gridline, and every number comes from a query linked under its chart. Appearing in these records is not an
        accusation, and most filings are lawful. See <a href="#method">what this page does not say</a>.
      </p>
      <dl className="formbar">
        <div>
          <dt>Cases on file</dt>
          <dd>{int(s.cases)}</dd>
        </div>
        <div>
          <dt>With a certified status</dt>
          <dd>{int(s.certified_status)}</dd>
        </div>
        <div>
          <dt>Employer names, normalized</dt>
          <dd>{int(s.employer_keys)}</dd>
        </div>
        <div>
          <dt>Decision years</dt>
          <dd>
            {s.first_year} to {s.last_year}
          </dd>
        </div>
      </dl>
    </header>
  );
}
