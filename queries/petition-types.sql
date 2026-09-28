-- Certified H-1B applications by employment type declared, per calendar year of decision.
-- f_* columns hold a worker COUNT (newer files) or a flag (older); "declared" = nullif(trim(x),'') NOT IN ('','0').
-- An application that declares several types is counted once in EACH type, so the four type counts
-- add up to more than the applications; applications_multi counts those that declare 2+ types.
-- Fields are blank for 2010-2015 and only 13% populated in 2016, so the window is 2017-2025 (2026 partial).
WITH f AS (
  SELECT decision_year AS year,
    coalesce(nullif(trim(f_new),''),'0') <> '0' AS is_new,
    coalesce(nullif(trim(f_continued),''),'0') <> '0' AS is_continued,
    coalesce(nullif(trim(f_change_employer),''),'0') <> '0' AS is_change,
    coalesce(nullif(trim(f_amended),''),'0') <> '0' AS is_amended,
    nullif(trim(f_new),'') IS NOT NULL AND nullif(trim(f_continued),'') IS NOT NULL
      AND nullif(trim(f_change_employer),'') IS NOT NULL AND nullif(trim(f_amended),'') IS NOT NULL AS populated
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2017 AND 2025
)
SELECT year,
  count(*) AS applications,
  count(*) FILTER (WHERE populated) AS populated_apps,
  count(*) FILTER (WHERE is_new) AS new_employment,
  count(*) FILTER (WHERE is_continued) AS continued,
  count(*) FILTER (WHERE is_change) AS change_employer,
  count(*) FILTER (WHERE is_amended) AS amended,
  count(*) FILTER (WHERE (is_new::int + is_continued::int + is_change::int + is_amended::int) >= 2) AS multi_type,
  count(*) FILTER (WHERE (is_new::int + is_continued::int + is_change::int + is_amended::int) = 0) AS none_declared
FROM f GROUP BY 1 ORDER BY 1
