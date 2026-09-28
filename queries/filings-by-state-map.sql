-- Certified H-1B applications (case_kind = 'LCA', status_n = 'CERTIFIED') by primary worksite state,
-- decision years 2023-2025 combined. Non-state worksites (territories, junk, blank) are dropped.
-- Paste at the top of a query. Maps full state names and abbreviations to one postal code for the 50 states + DC.
-- employer_state and worksite_state hold both "TX" and "TEXAS" (and junk); grouping raw values double-counts.
-- Usage: JOIN state_map sm ON upper(trim(f.worksite_state)) IN (sm.abbr, sm.name)  -> sm.abbr
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
SELECT sm.abbr AS state, count(*) AS certified
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') f
JOIN state_map sm ON upper(trim(f.worksite_state)) IN (sm.abbr, sm.name)
WHERE f.case_kind = 'LCA'
  AND f.status_n = 'CERTIFIED'
  AND f.decision_year BETWEEN 2023 AND 2025
GROUP BY 1
ORDER BY 2 DESC
