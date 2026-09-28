-- Median annualized offered wage (wage_from) by worksite state, certified H-1B applications decided 2023-2025.
-- Annualize: Year x1, Month x12, Bi-Weekly x26, Week x52, Hour x2080. Annual values below 15,000 or above 1,000,000 are dropped.
-- States (and DC) with fewer than 300 applications with a usable wage get median_wage = NULL (drawn as no data).
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
w AS (
  SELECT sm.abbr AS state,
         f.wage_from * CASE f.wage_unit WHEN 'Year' THEN 1 WHEN 'Month' THEN 12 WHEN 'Bi-Weekly' THEN 26
                                        WHEN 'Week' THEN 52 WHEN 'Hour' THEN 2080 END AS annual
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') f
  JOIN state_map sm ON upper(trim(f.worksite_state)) IN (sm.abbr, sm.name)
  WHERE f.case_kind = 'LCA' AND f.status_n = 'CERTIFIED' AND f.decision_year BETWEEN 2023 AND 2025
),
v AS (SELECT * FROM w WHERE annual BETWEEN 15000 AND 1000000)
SELECT state,
       count(*) AS applications,
       CASE WHEN count(*) >= 300 THEN round(median(annual)) END AS median_wage
FROM v
GROUP BY 1
ORDER BY 1
