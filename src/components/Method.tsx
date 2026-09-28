export function Method() {
  return (
    <section id="method" className="section">
      <hr className="perf" />
      <header className="section-head" style={{ paddingTop: 72 }}>
        <h2>How this was made, and what it does not say</h2>
      </header>
      <div className="method">
        <div>
          <h3>How the numbers were made</h3>
          <p>
            Every figure is a DuckDB query over a local copy of public records. Each chart names its query file and says what it counts as
            certified. Years are the calendar year of the Department of Labor&rsquo;s decision. 2026 is a partial year and is left out of trend
            lines.
          </p>
          <p>
            A blank in the source means the field was not collected in that era, not zero, so charts skip years where a field is mostly empty.
            The repository holds the queries and the aggregated results only. It holds no names, emails, phone numbers or street addresses.
          </p>
        </div>
        <div>
          <h3>Sources</h3>
          <ul>
            <li>
              Department of Labor,{" "}
              <a href="https://www.dol.gov/agencies/eta/foreign-labor/performance">Office of Foreign Labor Certification disclosure data</a>{" "}
              for the H-1B, H-1B1 and E-3 labor condition applications and for PERM.
            </li>
            <li>
              Small Business Administration, <a href="https://data.sba.gov/dataset/ppp-foia">Paycheck Protection Program FOIA loan data</a>.
            </li>
            <li>
              Environmental Protection Agency, <a href="https://www.epa.gov/ust">Underground Storage Tanks program</a> and its UST Finder.
            </li>
          </ul>
          <p>These were compiled into one research dataset of Parquet files, which this site queries.</p>
        </div>
        <div>
          <h3>What this page does not say</h3>
          <p>
            Appearing in these records is not an accusation, and everyone named is presumed to have followed the law. Most applications are
            lawful. A match between two datasets shows an apparent data relationship, not a finding of fact. Counts of applications are not
            counts of workers or visas.
          </p>
          <p>
            The records can contain errors carried over from the original files. Nothing here is legal advice, and none of it should be used to
            make decisions about any person.
          </p>
        </div>
        <div>
          <h3>Not included</h3>
          <p>
            The research dataset also holds FEMA building footprints and political donation matches. This edition does not chart them.
          </p>
          <p>
            To reproduce a chart, clone the research dataset, point <code>H1B_DATA_DIR</code> at it, and run{" "}
            <code>node scripts/run-query.mjs &lt;chart-id&gt;</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
