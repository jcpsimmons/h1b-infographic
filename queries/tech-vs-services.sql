-- Certified H-1B applications (LCAs) per calendar year of decision, 2010-2025, for two employer groups:
--   tech     = five large technology employers, matched on employer_name (upper-cased, trimmed) with the
--              explicit anchored patterns below. Only these name forms are counted; other subsidiaries or
--              spellings, and staffing or contractor filings made for these companies, are not.
--                Amazon    : ^AMAZON\.COM  |  ^AMAZON WEB SERVICES  |  ^AMAZON CORPORATE,? LLC  |
--                            ^AMAZON DEVELOPMENT CENTER U\.S\.  |  ^AMAZON DATA SERVICES  |
--                            ^AMAZON ADVERTISING  |  ^AMAZON FULFILLMENT SERVICES  |  ^AMAZON ROBOTICS
--                Google    : ^GOOGLE,? (INC|LLC)\.?$
--                Microsoft : ^MICROSOFT CORPORATION$
--                Meta      : ^FACEBOOK,? INC\.?$  |  ^META PLATFORMS, INC\.?$
--                Apple     : ^APPLE,? INC\.?$
--   services = the five largest IT-services majors in STAFFING-MAJORS by certified 2025 applications
--              (ranked in this query; currently Cognizant, TCS, Infosys, Accenture, HCL), attributed by
--              the dataset's curated gis_firm accept-list (a data relationship, not proof of anything).
-- case_kind = 'LCA' is the post-April-2009 form (>99.9% H-1B). Certified = status_n 'CERTIFIED' only.
-- 2009 (form change) and 2026 (partial year) are left out.
WITH tech AS (
  SELECT decision_year AS year, count(*) AS n
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2010 AND 2025
    AND regexp_matches(upper(trim(employer_name)),
      '^AMAZON\.COM|^AMAZON WEB SERVICES|^AMAZON CORPORATE,? LLC|^AMAZON DEVELOPMENT CENTER U\.S\.|^AMAZON DATA SERVICES|^AMAZON ADVERTISING|^AMAZON FULFILLMENT SERVICES|^AMAZON ROBOTICS'
      || '|^GOOGLE,? (INC|LLC)\.?$|^MICROSOFT CORPORATION$|^FACEBOOK,? INC\.?$|^META PLATFORMS, INC\.?$|^APPLE,? INC\.?$')
  GROUP BY 1
),
sm AS (
  SELECT gis_firm, decision_year
  FROM read_parquet('{{DATA}}/STAFFING-MAJORS/data/filing/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED'
),
top5 AS (
  SELECT gis_firm FROM sm WHERE decision_year = 2025 GROUP BY 1 ORDER BY count(*) DESC, gis_firm LIMIT 5
),
svc AS (
  SELECT decision_year AS year, count(*) AS n
  FROM sm WHERE gis_firm IN (SELECT gis_firm FROM top5) AND decision_year BETWEEN 2010 AND 2025
  GROUP BY 1
)
SELECT t.year, t.n AS tech, s.n AS services
FROM tech t JOIN svc s USING (year)
ORDER BY 1
