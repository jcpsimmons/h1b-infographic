-- Offered annualized wage divided by prevailing annualized wage, certified H-1B applications decided 2023-2025.
-- wage_from (low end of the offered range) is annualized with wage_unit; pw is annualized with pw_unit.
-- Multipliers: Year x1, Month x12, Bi-Weekly x26, Week x52, Hour x2080. Rows with any other/blank unit are dropped.
-- Trimming: both annual figures must be between 15,000 and 1,000,000 (this also removes zero or blank wages).
WITH base AS (
  SELECT
    wage_from * CASE wage_unit WHEN 'Year' THEN 1 WHEN 'Month' THEN 12 WHEN 'Bi-Weekly' THEN 26 WHEN 'Week' THEN 52 WHEN 'Hour' THEN 2080 END AS wage_annual,
    pw * CASE pw_unit WHEN 'Year' THEN 1 WHEN 'Month' THEN 12 WHEN 'Bi-Weekly' THEN 26 WHEN 'Week' THEN 52 WHEN 'Hour' THEN 2080 END AS pw_annual
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA'
    AND status_n = 'CERTIFIED'
    AND decision_year BETWEEN 2023 AND 2025
), kept AS (
  SELECT wage_annual / pw_annual AS ratio
  FROM base
  WHERE wage_annual BETWEEN 15000 AND 1000000
    AND pw_annual BETWEEN 15000 AND 1000000
), binned AS (
  SELECT
    CASE
      WHEN ratio < 1.00 THEN 0
      WHEN ratio < 1.05 THEN 1
      WHEN ratio < 1.10 THEN 2
      WHEN ratio >= 2.00 THEN 12
      ELSE 3 + CAST(floor((ratio - 1.10) / 0.10 + 1e-9) AS INTEGER)
    END AS b
  FROM kept
)
SELECT b AS bin_order,
  CASE b WHEN 0 THEN 'Below 1.00' WHEN 1 THEN '1.00-1.05' WHEN 2 THEN '1.05-1.10' WHEN 12 THEN '2.00+'
    ELSE printf('%.2f-%.2f', 1.10 + (b - 3) * 0.10, 1.20 + (b - 3) * 0.10) END AS bin,
  count(*) AS applications
FROM binned
GROUP BY b
ORDER BY b
