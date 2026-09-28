-- Final outcome of H-1B labor condition applications (case_kind = 'LCA') per calendar year of decision, 2010-2025.
-- Statuses outside the four named ones are folded into 'other'.
SELECT decision_year AS year,
  count(*) FILTER (WHERE status_n = 'CERTIFIED') AS certified,
  count(*) FILTER (WHERE status_n = 'CERTIFIEDWITHDRAWN') AS certified_withdrawn,
  count(*) FILTER (WHERE status_n = 'WITHDRAWN') AS withdrawn,
  count(*) FILTER (WHERE status_n = 'DENIED') AS denied,
  count(*) FILTER (WHERE status_n IS NULL OR status_n NOT IN ('CERTIFIED','CERTIFIEDWITHDRAWN','WITHDRAWN','DENIED')) AS other,
  count(*) AS total
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
WHERE case_kind = 'LCA'
  AND decision_year BETWEEN 2010 AND 2025
GROUP BY 1
ORDER BY 1
