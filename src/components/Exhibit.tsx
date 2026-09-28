import type { ReactNode } from "react";
import type { ChartMeta } from "@/lib/types";

/**
 * Frame for one chart: title, a one-sentence takeaway computed from the data,
 * the chart body, and a footnote with sources, definition and the query file.
 */
export function Exhibit({ meta, takeaway, children }: { meta: ChartMeta; takeaway: string; children: ReactNode }) {
  return (
    <figure id={meta.id} className={`exhibit exhibit-${meta.width}`}>
      <figcaption className="exhibit-head">
        <h3 className="exhibit-title">{meta.title}</h3>
        <p className="exhibit-takeaway">{takeaway}</p>
      </figcaption>
      <div className="exhibit-body">{children}</div>
      <p className="exhibit-foot">
        {meta.caveat ? <span>{meta.caveat} </span> : null}
        <span>
          Source: {meta.sources.join(", ")}. Query: <code>queries/{meta.id}.sql</code>.
        </span>
      </p>
    </figure>
  );
}
