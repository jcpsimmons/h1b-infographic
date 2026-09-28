-- Certified H-1B applications (case_kind 'LCA', status_n CERTIFIED) per employer group in a decision year.
-- An employer group is a distinct non-blank employer_key, the dataset's normalized-name grouping hint.
WITH y AS (
  SELECT decision_year AS yr, count(*) AS apps, count(DISTINCT employer_key) AS grps
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year IN (2010, 2025) AND employer_key IS NOT NULL AND employer_key <> ''
  GROUP BY 1
), w AS (
  SELECT max(apps) FILTER (WHERE yr = 2010) AS apps_2010, max(grps) FILTER (WHERE yr = 2010) AS groups_2010,
         max(apps) FILTER (WHERE yr = 2025) AS apps_2025, max(grps) FILTER (WHERE yr = 2025) AS groups_2025
  FROM y
)
SELECT *, apps_2010 * 1.0 / groups_2010 AS per_2010, apps_2025 * 1.0 / groups_2025 AS per_2025 FROM w
