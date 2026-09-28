import type { ComponentType } from "react";

export type SectionId = "volume" | "money" | "geography" | "employers" | "occupations" | "practice" | "linked";

export interface ChartMeta {
  /** kebab-case, must equal the file name in src/charts and the query name in queries/ */
  id: string;
  section: SectionId;
  /** sort order inside the section; lower comes first */
  order: number;
  /** sentence-case, states what is measured, max 80 characters */
  title: string;
  /** "full" spans the whole sheet, "half" shares a row with another chart */
  width: "half" | "full";
  /** dataset folders/tables the numbers come from, e.g. "LCA-PERM/filing_current" */
  sources: string[];
  /** plain-language definition and limits, e.g. what "certified" counts and which years are partial */
  caveat?: string;
}

export interface ChartModule {
  meta: ChartMeta;
  default: ComponentType;
}

export type Row = Record<string, string | number | null>;
