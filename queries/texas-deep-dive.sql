-- Texas worksite share of certified H-1B applications (LCAs), by decision year, 2010-2025.
-- Worksite = primary worksite_state on filing_current, normalized with the state map (50 states + DC only).
-- worksite_state is mostly blank in 2010 (21%), 2019 (16%) and partly in 2018 (86%); the guide's rule is to
-- drop years below about 80% coverage and never plot blanks as zero, so years under 90% coverage return NULL values.
WITH state_map(name, abbr) AS (VALUES
  ('ALABAMA', 'AL'),
  ('ALASKA', 'AK'),
  ('ARIZONA', 'AZ'),
  ('ARKANSAS', 'AR'),
  ('CALIFORNIA', 'CA'),
  ('COLORADO', 'CO'),
  ('CONNECTICUT', 'CT'),
  ('DELAWARE', 'DE'),
  ('DISTRICT OF COLUMBIA', 'DC'),
  ('FLORIDA', 'FL'),
  ('GEORGIA', 'GA'),
  ('HAWAII', 'HI'),
  ('IDAHO', 'ID'),
  ('ILLINOIS', 'IL'),
  ('INDIANA', 'IN'),
  ('IOWA', 'IA'),
  ('KANSAS', 'KS'),
  ('KENTUCKY', 'KY'),
  ('LOUISIANA', 'LA'),
  ('MAINE', 'ME'),
  ('MARYLAND', 'MD'),
  ('MASSACHUSETTS', 'MA'),
  ('MICHIGAN', 'MI'),
  ('MINNESOTA', 'MN'),
  ('MISSISSIPPI', 'MS'),
  ('MISSOURI', 'MO'),
  ('MONTANA', 'MT'),
  ('NEBRASKA', 'NE'),
  ('NEVADA', 'NV'),
  ('NEW HAMPSHIRE', 'NH'),
  ('NEW JERSEY', 'NJ'),
  ('NEW MEXICO', 'NM'),
  ('NEW YORK', 'NY'),
  ('NORTH CAROLINA', 'NC'),
  ('NORTH DAKOTA', 'ND'),
  ('OHIO', 'OH'),
  ('OKLAHOMA', 'OK'),
  ('OREGON', 'OR'),
  ('PENNSYLVANIA', 'PA'),
  ('RHODE ISLAND', 'RI'),
  ('SOUTH CAROLINA', 'SC'),
  ('SOUTH DAKOTA', 'SD'),
  ('TENNESSEE', 'TN'),
  ('TEXAS', 'TX'),
  ('UTAH', 'UT'),
  ('VERMONT', 'VT'),
  ('VIRGINIA', 'VA'),
  ('WASHINGTON', 'WA'),
  ('WEST VIRGINIA', 'WV'),
  ('WISCONSIN', 'WI'),
  ('WYOMING', 'WY')
)
,
f AS (
  SELECT f.decision_year AS year, sm.abbr AS st, f.worksite_state
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') f
  LEFT JOIN state_map sm ON upper(trim(f.worksite_state)) IN (sm.abbr, sm.name)
  WHERE f.case_kind = 'LCA' AND f.status_n = 'CERTIFIED' AND f.decision_year BETWEEN 2010 AND 2025
),
y AS (
  SELECT year,
         count(*) AS total_all,
         count(st) AS us_known,
         count(*) FILTER (WHERE st = 'TX') AS tx
  FROM f GROUP BY 1
),
rk AS (
  SELECT year, st, rank() OVER (PARTITION BY year ORDER BY count(*) DESC) AS r
  FROM f WHERE st IS NOT NULL GROUP BY year, st
)
SELECT y.year,
       CASE WHEN y.us_known >= 0.9 * y.total_all THEN y.tx END AS texas,
       CASE WHEN y.us_known >= 0.9 * y.total_all THEN round(100.0 * y.tx / y.us_known, 2) END AS share,
       CASE WHEN y.us_known >= 0.9 * y.total_all THEN rk.r END AS rank,
       round(100.0 * y.us_known / y.total_all, 1) AS coverage
FROM y JOIN rk ON rk.year = y.year AND rk.st = 'TX'
ORDER BY 1
