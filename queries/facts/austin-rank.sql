-- Austin, Texas among worksite cities (upper/trim of worksite_city, with a valid worksite state) for certified H-1B applications (case_kind 'LCA').
-- Only applications whose employer state and worksite state both map to a state or DC are counted.
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
, f AS (
  SELECT f.decision_year AS y, ws.abbr AS w, upper(trim(f.worksite_city)) AS city
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') f
  JOIN state_map es ON upper(trim(f.employer_state)) IN (es.abbr, es.name)
  JOIN state_map ws ON upper(trim(f.worksite_state)) IN (ws.abbr, ws.name)
  WHERE f.case_kind = 'LCA' AND f.status_n = 'CERTIFIED'
), c AS (SELECT y, city, w, count(*) AS n FROM f GROUP BY ALL),
r AS (SELECT *, rank() OVER (PARTITION BY y ORDER BY n DESC) AS rk FROM c),
a AS (SELECT y, n, rk FROM r WHERE city = 'AUSTIN' AND w = 'TX'),
s AS (SELECT y, n FROM r WHERE city = 'SAN FRANCISCO' AND w = 'CA')
SELECT (SELECT n FROM a WHERE y = 2012) AS austin_2012, (SELECT rk FROM a WHERE y = 2012) AS rank_2012,
       (SELECT n FROM a WHERE y = 2025) AS austin_2025, (SELECT rk FROM a WHERE y = 2025) AS rank_2025,
       (SELECT n FROM s WHERE y = 2025) AS sf_2025,
       (SELECT max(a.y) FROM a JOIN s USING (y) WHERE a.n <= s.n AND a.y BETWEEN 2012 AND 2025) + 1 AS ahead_of_sf_since
