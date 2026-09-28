-- PERM outcomes per calendar year of decision, 2010-2025 (case_kind PERM, PERM-NEW, PERM-BACKLOG).
-- certified = CERTIFIED + CERTIFIEDEXPIRED; denied = DENIED; withdrawn = WITHDRAWN.
-- Other status_n values (e.g. CERTIFIEDWITHDRAWN) are not counted.
-- 2026 is a partial year and 2007-2009 are earlier years, so the window is 2010-2025.
SELECT decision_year AS year,
       count(*) FILTER (WHERE status_n IN ('CERTIFIED', 'CERTIFIEDEXPIRED')) AS certified,
       count(*) FILTER (WHERE status_n = 'DENIED') AS denied,
       count(*) FILTER (WHERE status_n = 'WITHDRAWN') AS withdrawn
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
WHERE case_kind LIKE 'PERM%'
  AND decision_year BETWEEN 2010 AND 2025
GROUP BY 1
ORDER BY 1
