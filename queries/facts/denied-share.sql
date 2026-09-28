-- Share of H-1B labor condition applications (case_kind 'LCA') decided as DENIED, by calendar year of decision.
-- Denominator: every LCA application decided that year (certified, certified then withdrawn, withdrawn, denied).
-- October 2025 has unusually few decisions in the file, so the 2025 share is also given without that month.
WITH y AS (
  SELECT decision_year AS yr, count(*) AS decided, count(*) FILTER (WHERE status_n = 'DENIED') AS denied,
         count(*) FILTER (WHERE NOT (decision_year = 2025 AND month(decision_date) = 10)) AS decided_ex_oct,
         count(*) FILTER (WHERE status_n = 'DENIED' AND NOT (decision_year = 2025 AND month(decision_date) = 10)) AS denied_ex_oct
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') WHERE case_kind = 'LCA' AND decision_year IN (2010, 2025) GROUP BY 1
)
SELECT max(decided) FILTER (WHERE yr = 2010) AS decided_2010, max(denied) FILTER (WHERE yr = 2010) AS denied_2010,
       max(decided) FILTER (WHERE yr = 2025) AS decided_2025, max(denied) FILTER (WHERE yr = 2025) AS denied_2025,
       max(denied) FILTER (WHERE yr = 2010) * 1.0 / max(decided) FILTER (WHERE yr = 2010) AS share_2010,
       max(denied) FILTER (WHERE yr = 2025) * 1.0 / max(decided) FILTER (WHERE yr = 2025) AS share_2025,
       max(denied_ex_oct) FILTER (WHERE yr = 2025) * 1.0 / max(decided_ex_oct) FILTER (WHERE yr = 2025) AS share_2025_ex_oct
FROM y
