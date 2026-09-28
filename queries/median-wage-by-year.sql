-- Median annualized offered wage (wage_from) and prevailing wage (pw), certified H-1B LCAs, by decision year 2010-2025.
-- Annualize: Year x1, Month x12, Bi-Weekly x26, Week x52, Hour x2080. Usable = annual value in 15,000..1,000,000.
-- A year is plotted only if >= 80% of its certified rows have a usable value for BOTH measures; else both NULL (gap).
-- months_covered = months of the year in which at least half of the applications have a usable value for both
-- measures. Some years are blank for whole months (2014 and 2018 for October to December), so their medians
-- describe only the months that have data.
WITH b AS (
  SELECT decision_year AS y, month(decision_date) AS mo,
    wage_from * CASE lower(trim(wage_unit)) WHEN 'year' THEN 1 WHEN 'month' THEN 12 WHEN 'bi-weekly' THEN 26 WHEN 'week' THEN 52 WHEN 'hour' THEN 2080 END AS w,
    pw * CASE lower(trim(pw_unit)) WHEN 'year' THEN 1 WHEN 'month' THEN 12 WHEN 'bi-weekly' THEN 26 WHEN 'week' THEN 52 WHEN 'hour' THEN 2080 END AS p
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2010 AND 2025
),
mo AS (
  SELECT y, mo,
    count(*) FILTER (WHERE w BETWEEN 15000 AND 1000000 AND p BETWEEN 15000 AND 1000000) >= 0.5 * count(*) AS covered
  FROM b GROUP BY 1, 2
),
mc AS (SELECT y, count(*) FILTER (WHERE covered) AS months_covered FROM mo GROUP BY 1),
c AS (
  SELECT y, count(*) AS n,
    count(*) FILTER (WHERE w BETWEEN 15000 AND 1000000) AS w_n,
    count(*) FILTER (WHERE p BETWEEN 15000 AND 1000000) AS p_n,
    median(w) FILTER (WHERE w BETWEEN 15000 AND 1000000) AS w_med,
    median(p) FILTER (WHERE p BETWEEN 15000 AND 1000000) AS p_med
  FROM b GROUP BY 1
)
SELECT c.y AS year, n AS applications,
  round(100.0 * w_n / n, 1) AS offered_coverage_pct,
  round(100.0 * p_n / n, 1) AS prevailing_coverage_pct,
  mc.months_covered AS months_covered,
  CASE WHEN w_n >= 0.8 * n AND p_n >= 0.8 * n THEN round(w_med) END AS offered,
  CASE WHEN w_n >= 0.8 * n AND p_n >= 0.8 * n THEN round(p_med) END AS prevailing
FROM c JOIN mc USING (y) ORDER BY 1
