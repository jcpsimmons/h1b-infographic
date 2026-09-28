-- Share of certified H-1B applications (case_kind = 'LCA', status_n = 'CERTIFIED') filed by the top 10, 100 and
-- 1,000 employers, ranked each decision year on employer_key (ties broken by key). Applications with no employer_key are
-- left out of both numerator and denominator.
WITH c AS (
  SELECT decision_year AS year, employer_key, count(*) AS n
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED'
    AND decision_year BETWEEN 2010 AND 2025
    AND employer_key IS NOT NULL AND trim(employer_key) <> ''
  GROUP BY 1, 2
), r AS (
  SELECT *, row_number() OVER (PARTITION BY year ORDER BY n DESC, employer_key) AS rk FROM c
)
SELECT year,
  sum(n)::INTEGER AS total,
  count(*) AS employers,
  round(100.0 * sum(n) FILTER (rk <= 10) / sum(n), 2) AS top10,
  round(100.0 * sum(n) FILTER (rk <= 100) / sum(n), 2) AS top100,
  round(100.0 * sum(n) FILTER (rk <= 1000) / sum(n), 2) AS top1000
FROM r GROUP BY 1 ORDER BY 1
