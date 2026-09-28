-- Employer groups (employer_key, non-blank) ranked by certified H-1B LCA applications, decision years 2010-2025.
-- Smallest number of groups whose combined certified applications reach half of the total.
WITH e AS (
  SELECT employer_key, count(*) AS n
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2010 AND 2025
    AND employer_key IS NOT NULL AND employer_key <> ''
  GROUP BY 1
), r AS (
  SELECT n, sum(n) OVER (ORDER BY n DESC, employer_key ROWS UNBOUNDED PRECEDING) AS cum FROM e
), t AS (SELECT sum(n) AS total, count(*) AS employer_groups FROM e)
SELECT (SELECT count(*) FROM r WHERE cum - n < 0.5 * t.total) AS groups_for_half,
       t.employer_groups, t.total AS certified_applications,
       round(100.0 * (SELECT count(*) FROM r WHERE cum - n < 0.5 * t.total) / t.employer_groups, 3) AS pct_of_groups
FROM t
