-- Share of certified H-1B applications (case_kind LCA, status_n CERTIFIED), decision_year 2020-2025, whose annualized
-- offered wage_from equals the annualized prevailing wage pw exactly. Both annualized (Year x1, Month x12, Bi-Weekly x26,
-- Week x52, Hour x2080); rows with either annual value outside 15,000..1,000,000 or a null unit are dropped.
WITH t AS (SELECT wage_from * CASE wage_unit WHEN 'Year' THEN 1 WHEN 'Month' THEN 12 WHEN 'Bi-Weekly' THEN 26 WHEN 'Week' THEN 52 WHEN 'Hour' THEN 2080 END AS aw, pw * CASE pw_unit WHEN 'Year' THEN 1 WHEN 'Month' THEN 12 WHEN 'Bi-Weekly' THEN 26 WHEN 'Week' THEN 52 WHEN 'Hour' THEN 2080 END AS apw FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2020 AND 2025)
SELECT count(*) AS applications, sum((aw = apw)::INT) AS exact_match, round(100.0 * avg((aw = apw)::INT), 1) AS pct_exact
FROM t WHERE aw BETWEEN 15000 AND 1000000 AND apw BETWEEN 15000 AND 1000000
