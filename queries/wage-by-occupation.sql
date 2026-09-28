-- Median annualized offered wage (wage_from) for the 15 occupations (soc_code) with the most certified
-- H-1B applications decided 2023-2025. case_kind = 'LCA' is the post-April-2009 LCA form (>99.9% H-1B).
-- Certified = status_n 'CERTIFIED'. Occupations need at least 1,000 certified applications.
-- SOC codes are written two ways in this window: '15-1252.00' and, on about 1% of rows, '15-1252'.
-- The short form is completed with '.00' so both count as one occupation (without this, the ranking is off).
-- Ranking uses all certified applications; the median uses those with a plausible annualized wage
-- (15,000 to 1,000,000). Label = most common soc_title within the soc_code.
WITH base AS (
  SELECT
    CASE WHEN regexp_matches(trim(soc_code), '^[0-9]{2}-[0-9]{4}$') THEN trim(soc_code) || '.00' ELSE trim(soc_code) END AS soc_code,
    soc_title,
    CASE wage_unit WHEN 'Year' THEN wage_from WHEN 'Month' THEN wage_from * 12
      WHEN 'Bi-Weekly' THEN wage_from * 26 WHEN 'Week' THEN wage_from * 52
      WHEN 'Hour' THEN wage_from * 2080 END AS annual
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED'
    AND decision_year BETWEEN 2023 AND 2025 AND soc_code IS NOT NULL
),
agg AS (
  SELECT soc_code, count(*) AS applications,
    count(*) FILTER (WHERE annual BETWEEN 15000 AND 1000000) AS with_wage,
    median(annual) FILTER (WHERE annual BETWEEN 15000 AND 1000000) AS median_wage
  FROM base GROUP BY 1 HAVING count(*) >= 1000
),
top15 AS (SELECT * FROM agg ORDER BY applications DESC, soc_code LIMIT 15),
lbl AS (
  SELECT soc_code, soc_title FROM (
    SELECT soc_code, soc_title, row_number() OVER (PARTITION BY soc_code ORDER BY count(*) DESC, soc_title) rn
    FROM base WHERE soc_title IS NOT NULL GROUP BY soc_code, soc_title) WHERE rn = 1
)
SELECT t.soc_code, l.soc_title AS occupation, t.applications, t.with_wage, round(t.median_wage) AS median_wage
FROM top15 t LEFT JOIN lbl l USING (soc_code)
ORDER BY median_wage DESC, applications DESC
