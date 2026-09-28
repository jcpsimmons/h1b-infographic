-- Top 15 job titles (free text as filed) by certified H-1B applications, decision years 2023-2025.
-- case_kind = 'LCA' is the post-April-2009 LCA form (>99.9% H-1B); certified = status_n 'CERTIFIED' only.
-- Title normalization: uppercase, non-breaking spaces to spaces, trim, collapse repeated spaces.
-- Blank titles are dropped from the ranking. Titles are not merged beyond that, so variants stay separate.
SELECT trim(regexp_replace(replace(upper(job_title), chr(160), ' '), '\s+', ' ', 'g')) AS title,
       count(*) AS certified
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
WHERE case_kind = 'LCA'
  AND status_n = 'CERTIFIED'
  AND decision_year BETWEEN 2023 AND 2025
  AND job_title IS NOT NULL
  AND trim(regexp_replace(replace(upper(job_title), chr(160), ' '), '\s+', ' ', 'g')) <> ''
GROUP BY 1
ORDER BY certified DESC, title
LIMIT 15
