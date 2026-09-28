import type { SectionId } from "./types";

export const SECTIONS: { id: SectionId; title: string; lede: string }[] = [
  { id: "volume", title: "How many cases, and when?", lede: "Filing and decision counts across two decades of Department of Labor disclosure files." },
  { id: "money", title: "What do the jobs pay?", lede: "Offered wages set against the prevailing wage the employer attests to." },
  { id: "geography", title: "Where is the work?", lede: "Worksite states and cities named on the applications." },
  { id: "employers", title: "Who files?", lede: "The employers behind the filings, and how concentrated the filing is." },
  { id: "occupations", title: "What kinds of jobs?", lede: "Occupation codes, job titles and industries." },
  { id: "practice", title: "How are the jobs set up?", lede: "End clients, worksites and other details employers declare on the form." },
  { id: "linked", title: "What lines up in other public records?", lede: "Filings joined to other government datasets. A join shows a data relationship, not a finding." },
];
