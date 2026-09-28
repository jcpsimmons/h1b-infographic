-- Certified H-1B applications by prevailing wage level (pw_level) and calendar year of decision.
-- pw_level is blank for whole months in many years (it is stated for about 95% of applications in the months
-- that have it, and for none in the others), so a year's shares can describe only part of that year.
-- A year is kept only if every one of its 12 months has a level stated on at least 50% of certified applications.
-- That keeps 2020 to 2025. Dropped: 2010-2013 (none stated); 2014, 2016 and 2019 (stated for October to December only);
-- and 2015 and 2018 (blank October to December) and 2017 (blank July to September), which would compare partial years.
-- pw_level is normalised (strip the word "Level", trim, upper-case); anything other than I-IV is 'Not stated'.
WITH base AS (
  SELECT decision_year AS year, month(decision_date) AS mo,
         CASE WHEN upper(trim(replace(upper(coalesce(pw_level, '')), 'LEVEL', ''))) IN ('I','II','III','IV')
              THEN upper(trim(replace(upper(pw_level), 'LEVEL', '')))
              ELSE 'Not stated' END AS lvl
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA'
    AND status_n = 'CERTIFIED'
    AND decision_year BETWEEN 2010 AND 2025
),
mo AS (
  SELECT year, mo, avg(CASE WHEN lvl <> 'Not stated' THEN 1.0 ELSE 0 END) AS stated
  FROM base GROUP BY year, mo
),
cov AS (
  SELECT year FROM mo GROUP BY year HAVING count(*) = 12 AND min(stated) >= 0.5
)
SELECT year,
       count(*) FILTER (WHERE lvl = 'I')          AS level_i,
       count(*) FILTER (WHERE lvl = 'II')         AS level_ii,
       count(*) FILTER (WHERE lvl = 'III')        AS level_iii,
       count(*) FILTER (WHERE lvl = 'IV')         AS level_iv,
       count(*) FILTER (WHERE lvl = 'Not stated') AS not_stated,
       count(*)                                   AS total
FROM base WHERE year IN (SELECT year FROM cov)
GROUP BY year ORDER BY year
