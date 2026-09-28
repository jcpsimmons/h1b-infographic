-- Certified H-1B labor condition applications per calendar year of decision, 2010-2025.
-- case_kind = 'LCA' is the post-April-2009 LCA form, which is >99.9% H-1B (E-3 and H-1B1 files sit
-- under LCA-LEGACY). Filtering on visa_class = 'H-1B' would drop 2009-2010, where visa_class is often blank.
-- 2009 is a form-transition year and 2026 is a partial year, so both are left out.
SELECT decision_year AS year, count(*) AS certified
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
WHERE case_kind = 'LCA'
  AND status_n = 'CERTIFIED'
  AND decision_year BETWEEN 2010 AND 2025
GROUP BY 1
ORDER BY 1
