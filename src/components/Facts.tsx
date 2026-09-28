import facts from "@/data/facts.json";

type Fact = { rank: number; value: string; headline: string; detail: string; how: string; query: string };

export function Facts() {
  const rows = facts as Fact[];
  if (rows.length === 0) return null;
  return (
    <section id="facts" className="section" style={{ paddingTop: 88 }}>
      <header className="section-head">
        <h2>Ten things the data says</h2>
        <p>Each figure was computed once, then recomputed independently by a second pass that saw only the claim. Open a row to see how it was counted.</p>
      </header>
      <ol className="ledger">
        {rows.map((f) => (
          <li className="fact" key={f.rank}>
            <span className="fact-rank">{f.rank}</span>
            <span className="fact-value">{f.value}</span>
            <div className="fact-text">
              <p>{f.headline}</p>
              {f.detail ? <p className="fact-detail">{f.detail}</p> : null}
              <details>
                <summary>How this was counted</summary>
                <p>{f.how}</p>
                <p>
                  Query: <code>{f.query}</code>
                </p>
              </details>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
