-- Top 20 worksite cities (city + state) by certified H-1B applications, decision years 2023-2025.
-- case_kind = 'LCA' is the post-April-2009 LCA form (>99.9% H-1B); certified = status_n 'CERTIFIED' only.
-- City text: uppercase, non-breaking spaces to spaces, trim, collapse spaces, drop trailing commas/periods.
-- Merged variants (same state only): NEW YORK CITY -> NEW YORK, SAN FRANCSICO / SAN FRANSISCO -> SAN FRANCISCO.
-- Other spelling variants may remain. Boroughs (e.g. BROOKLYN) are kept as filed.
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
, norm AS (
  SELECT sm.abbr AS state,
         trim(regexp_replace(regexp_replace(replace(upper(f.worksite_city), chr(160), ' '), '[\s]+', ' ', 'g'), '[,.\s]+$', '')) AS city0
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') f
  JOIN state_map sm ON upper(trim(f.worksite_state)) IN (sm.abbr, sm.name)
  WHERE f.case_kind = 'LCA' AND f.status_n = 'CERTIFIED' AND f.decision_year BETWEEN 2023 AND 2025
    AND f.worksite_city IS NOT NULL
), merged AS (
  SELECT state,
         CASE WHEN city0 = 'NEW YORK CITY' AND state = 'NY' THEN 'NEW YORK'
              WHEN city0 IN ('SAN FRANCSICO', 'SAN FRANSISCO') AND state = 'CA' THEN 'SAN FRANCISCO'
              ELSE city0 END AS city
  FROM norm
  WHERE city0 <> ''
)
SELECT city, state, count(*) AS certified
FROM merged
GROUP BY 1, 2
ORDER BY certified DESC, city
LIMIT 20
