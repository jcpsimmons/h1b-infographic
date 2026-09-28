-- Share of certified H-1B applications (case_kind = 'LCA', status_n = 'CERTIFIED') on which the employer
-- answered "H-1B dependent" = YES on the form. h1b_dependent is blank for all of 2010-2020 and for January-September 2021
-- (20% filled in 2021), and blank again for October-December 2024 (81% filled), so only years where at least
-- 80% of certified applications carry an answer are kept.
-- Share is computed over applications that carry an answer; coverage and months with answers are reported alongside.
-- share_jan_sep_pct is the same share using January-September decisions only, so 2024 (no answers after September)
-- can be compared like for like with the other years.
WITH t AS (
  SELECT decision_year AS year,
         count(*) AS certified,
         count(*) FILTER (WHERE upper(trim(h1b_dependent)) IN ('YES', 'NO')) AS answered,
         count(*) FILTER (WHERE upper(trim(h1b_dependent)) = 'YES') AS dependent,
         count(DISTINCT month(decision_date)) FILTER (WHERE upper(trim(h1b_dependent)) IN ('YES', 'NO')) AS months_answered,
         count(*) FILTER (WHERE month(decision_date) <= 9 AND upper(trim(h1b_dependent)) IN ('YES', 'NO')) AS answered_jan_sep,
         count(*) FILTER (WHERE month(decision_date) <= 9 AND upper(trim(h1b_dependent)) = 'YES') AS dependent_jan_sep
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA'
    AND status_n = 'CERTIFIED'
    AND decision_year BETWEEN 2010 AND 2025
  GROUP BY 1
)
SELECT year, certified, answered, dependent, months_answered,
       round(100.0 * answered / certified, 1) AS coverage_pct,
       round(100.0 * dependent / answered, 2) AS share_pct,
       round(100.0 * dependent_jan_sep / answered_jan_sep, 2) AS share_jan_sep_pct
FROM t
WHERE answered >= 0.8 * certified
ORDER BY year
