-- H-1B applications (case_kind = 'LCA', >99.9% H-1B) received per calendar year and month, 2010-2025.
-- Any final status is counted; the grouping is on received_date, not decision date.
-- 2010 is the first full year on the post-April-2009 form; 2026 is a partial year (data ends 2026-06-30).
-- gap = TRUE when a month holds under a quarter of that year's median monthly count. Only October 2025
-- does (1,164 applications against roughly 35,000 in its neighbours): the source has almost no records
-- for that month, so it is flagged as missing data instead of being read as a real low.
WITH m AS (
  SELECT year(received_date) AS year, month(received_date) AS month, count(*) AS n
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA'
    AND received_date >= DATE '2010-01-01' AND received_date < DATE '2026-01-01'
  GROUP BY 1, 2
)
SELECT year, month, n,
  n < 0.25 * quantile_cont(n, 0.5) OVER (PARTITION BY year) AS gap
FROM m
ORDER BY 1, 2
