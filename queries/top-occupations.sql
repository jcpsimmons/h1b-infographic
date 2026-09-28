-- Top 20 occupations by certified H-1B applications, decision years 2023-2025.
-- case_kind = 'LCA' is the post-April-2009 LCA form (>99.9% H-1B); certified = status_n 'CERTIFIED' only.
-- soc_code is filed with a detail suffix (15-2051.01) on about 99% of rows and without one (15-2051) on the rest.
-- Grouped on the detailed code, with a '.00' suffix treated the same as none (15-1252.00 = 15-1252). The 6-digit
-- group is NOT used because it mixes different jobs: 15-1299 holds both systems engineers/architects (15-1299.08)
-- and IT project managers (15-1299.09), 15-2051 holds data scientists and business intelligence analysts.
-- Rows whose code is not of the form NN-NNNN or NN-NNNN.NN (a few dozen typos) are dropped from numerator and denominator.
-- Label = most frequent soc_title filed under that code, with any leading code text removed.
WITH base AS (
  SELECT regexp_replace(trim(soc_code), '\.00$', '') AS soc,
         trim(regexp_replace(trim(soc_title), '^[0-9]{2}-[0-9]{4}(\.[0-9]{2})?\s*-?\s*', '')) AS title
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2023 AND 2025
    AND regexp_matches(trim(soc_code), '^[0-9]{2}-[0-9]{4}(\.[0-9]{2})?$')
), titles AS (
  SELECT soc, title, count(*) AS n FROM base WHERE title <> '' GROUP BY 1, 2
), tot AS (
  SELECT soc, count(*) AS certified FROM base GROUP BY 1
)
SELECT t.soc AS soc_code, arg_max(t.title, t.n) AS soc_title, any_value(o.certified) AS certified,
       round(100.0 * any_value(o.certified) / (SELECT count(*) FROM base), 2) AS share_pct
FROM titles t JOIN tot o USING (soc)
GROUP BY t.soc
ORDER BY certified DESC, soc_code
LIMIT 20
