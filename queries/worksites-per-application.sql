-- Certified H-1B applications by number of worksites declared (total_worksites), decision years 2020-2025.
-- total_worksites is empty for 2010-2018 and ~15% populated in 2019, so the window starts in 2020.
-- The field never exceeds 10 (values top out at 10), so "11 or more" cannot be separated: the top bucket is 6 or more.
-- q1_total / q1_multi count January-March decisions only: the multi-worksite share climbed steadily through 2020
-- (checked against the per-case rows in worksite_expanded, which agree), so the caveat quotes the early-2020 share.
SELECT decision_year AS year,
  count(*) FILTER (WHERE total_worksites = 1) AS w1,
  count(*) FILTER (WHERE total_worksites = 2) AS w2,
  count(*) FILTER (WHERE total_worksites BETWEEN 3 AND 5) AS w3_5,
  count(*) FILTER (WHERE total_worksites >= 6) AS w6_plus,
  count(*) AS total,
  count(*) FILTER (WHERE month(decision_date) <= 3) AS q1_total,
  count(*) FILTER (WHERE month(decision_date) <= 3 AND total_worksites >= 2) AS q1_multi
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
WHERE case_kind = 'LCA'
  AND status_n = 'CERTIFIED'
  AND decision_year BETWEEN 2020 AND 2025
  AND total_worksites IS NOT NULL
GROUP BY 1
ORDER BY 1
