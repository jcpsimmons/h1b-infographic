-- Certified H-1B applications (case_kind = 'LCA', status_n = 'CERTIFIED'), decision years 2023-2025, where the
-- employer's address state differs from the worksite state. Both states normalized with docs/state-map.sql;
-- applications where either state is not one of the 50 states or DC are excluded from the denominator too.
-- Each row carries the overall totals so the takeaway can state the share of differing applications.
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
),
base AS (
  SELECT es.abbr AS employer_st, ws.abbr AS worksite_st
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') f
  JOIN state_map es ON upper(trim(f.employer_state)) IN (es.abbr, es.name)
  JOIN state_map ws ON upper(trim(f.worksite_state)) IN (ws.abbr, ws.name)
  WHERE f.case_kind = 'LCA' AND f.status_n = 'CERTIFIED' AND f.decision_year BETWEEN 2023 AND 2025
),
tot AS (
  SELECT count(*) AS total_apps, count(*) FILTER (WHERE employer_st <> worksite_st) AS differing_apps FROM base
),
pairs AS (
  SELECT employer_st, worksite_st, count(*) AS applications
  FROM base WHERE employer_st <> worksite_st
  GROUP BY 1, 2 ORDER BY applications DESC, employer_st, worksite_st LIMIT 12
)
SELECT employer_st || ' to ' || worksite_st AS pair, employer_st, worksite_st, applications, total_apps, differing_apps
FROM pairs, tot
ORDER BY applications DESC, pair
