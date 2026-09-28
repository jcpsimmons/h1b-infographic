-- Employers (employer_key, as named on filings) in 2025 bucketed by number of certified H-1B applications
-- (case_kind = 'LCA', status_n = 'CERTIFIED', decision_year = 2025), with each bucket's share of employers and of applications.
-- Applications with no employer_key are left out of both numerator and denominator.
WITH c AS (
  SELECT employer_key, count(*) AS n
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year = 2025
    AND employer_key IS NOT NULL AND trim(employer_key) <> ''
  GROUP BY 1
), b AS (
  SELECT *, CASE WHEN n = 1 THEN 1 WHEN n <= 4 THEN 2 WHEN n <= 19 THEN 3 WHEN n <= 99 THEN 4 WHEN n <= 999 THEN 5 ELSE 6 END AS ord,
    CASE WHEN n = 1 THEN '1' WHEN n <= 4 THEN '2-4' WHEN n <= 19 THEN '5-19' WHEN n <= 99 THEN '20-99' WHEN n <= 999 THEN '100-999' ELSE '1,000 or more' END AS bucket
  FROM c
)
SELECT bucket, count(*) AS employers, sum(n)::BIGINT::DOUBLE AS applications,
  round(100.0 * count(*) / sum(count(*)) OVER (), 2) AS employer_share,
  round(100.0 * sum(n) / sum(sum(n)) OVER (), 2) AS application_share
FROM b GROUP BY bucket, ord ORDER BY ord
