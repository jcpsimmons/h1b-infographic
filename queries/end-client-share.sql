-- Share of certified H-1B applications (case_kind = 'LCA', status_n = 'CERTIFIED') by decision year, 2020-2025,
-- that name an end client, using LCA-PERM/AGENTS.md rule 8: secondary_entity IN ('Yes','Y') AND secondary_name <> ''.
-- Names that are really a home or remote-work placeholder ('HOME ADDRESS', "BENEFICIARY'S RESIDENCE", 'REMOTE',
-- 'TELECOMMUTING', ...) are split out by the text pattern below, so 'named' counts only names that look like an
-- organization. The pattern is not exhaustive (a few placeholders such as 'MAY WORK REMOTELY' still count as named).
-- Also the count where secondary_entity is Yes/Y but the name is blank or missing.
-- secondary_entity is fully populated from 2020 (0% in 2018, 20% in 2019), so the window starts at 2020; 2026 is partial.
WITH f AS (
  SELECT decision_year AS year,
    secondary_entity IN ('Yes','Y') AS yes,
    coalesce(trim(secondary_name),'') AS nm,
    regexp_matches(upper(trim(coalesce(secondary_name,''))),
      '^(THE )?(BENEFICIARY|EMPLOYEE)|RESIDEN(CE|TIAL)|^HOME (ADDRESS|OFFICE|LOCATION|WORKSITE|RESIDENCE|WORK)|^(REMOTE|REMOTELY)( |$)|WORK(ING)? FROM HOME|TELECOMMUT|^HOUSE$|^HOME$|^(N/A|NA|NONE|NOT APPLICABLE|TBD)$') AS ph
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2020 AND 2025
    AND secondary_entity IS NOT NULL
)
SELECT year,
  count(*) AS total,
  count(*) FILTER (WHERE yes AND nm <> '' AND NOT ph) AS named,
  count(*) FILTER (WHERE yes AND nm <> '' AND ph) AS placeholder,
  count(*) FILTER (WHERE yes AND nm = '') AS yes_no_name,
  round(100.0 * count(*) FILTER (WHERE yes AND nm <> '' AND NOT ph) / count(*), 2) AS named_pct,
  round(100.0 * count(*) FILTER (WHERE yes AND nm <> '' AND ph) / count(*), 2) AS placeholder_pct,
  round(100.0 * count(*) FILTER (WHERE yes AND nm = '') / count(*), 2) AS yes_no_name_pct
FROM f
GROUP BY 1
ORDER BY 1
