"use client";

import { charts } from "@/charts/registry";
import { SECTIONS } from "@/lib/sections";

const present = SECTIONS.filter((s) => charts.some((c) => c.meta.section === s.id));

/** In-page links to the sections that have charts. */
export function Contents({ hasFacts }: { hasFacts: boolean }) {
  return (
    <nav className="toc" aria-label="Sections">
      {hasFacts ? <a href="#facts">Ten facts</a> : null}
      {present.map((s) => (
        <a key={s.id} href={`#${s.id}`}>
          {s.title.replace(/\?$/, "")}
        </a>
      ))}
    </nav>
  );
}

export function Sections() {
  return (
    <>
      {present.map((s) => {
        const items = charts.filter((c) => c.meta.section === s.id).sort((a, b) => a.meta.order - b.meta.order);
        return (
          <section key={s.id} id={s.id} className="section">
            <hr className="perf" />
            <header className="section-head" style={{ paddingTop: 72 }}>
              <h2>{s.title}</h2>
              <p>{s.lede}</p>
            </header>
            <div className="exhibits">
              {items.map((c) => {
                const Chart = c.default;
                return <Chart key={c.meta.id} />;
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
