-- Median offered wage (wage_from, annualized: Year x1, Month x12, Bi-Weekly x26, Week x52, Hour x2080) on certified H-1B applications.
-- Rows with an annual value outside 15,000..1,000,000 or a null unit are dropped. Nominal dollars.
WITH t AS (
  SELECT decision_year AS yr, wage_from * CASE wage_unit WHEN 'Year' THEN 1 WHEN 'Month' THEN 12 WHEN 'Bi-Weekly' THEN 26 WHEN 'Week' THEN 52 WHEN 'Hour' THEN 2080 END AS aw
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year IN (2011, 2025)
), u AS (SELECT yr, aw FROM t WHERE aw BETWEEN 15000 AND 1000000)
SELECT median(aw) FILTER (WHERE yr = 2011) AS median_2011, median(aw) FILTER (WHERE yr = 2025) AS median_2025,
       median(aw) FILTER (WHERE yr = 2025) / median(aw) FILTER (WHERE yr = 2011) AS ratio,
       count(*) FILTER (WHERE yr = 2011) AS n_2011, count(*) FILTER (WHERE yr = 2025) AS n_2025
FROM u
