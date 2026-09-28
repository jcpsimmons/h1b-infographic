-- Share of certified H-1B applications by the employer's state (employer_state), 2010 vs 2025.
-- worksite_state is only ~21% populated in 2010 (a blank means "not collected"), so employer_state (>99.9% in both years) is used.
-- Share denominator = certified LCAs in that year whose employer_state maps to a state or DC (state_map).
-- The 12 states with the largest 2025 share are kept. case_kind = 'LCA'; certified = status_n 'CERTIFIED'.
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
f AS (
  SELECT f.decision_year AS year, sm.abbr AS state
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') f
  JOIN state_map sm ON upper(trim(f.employer_state)) IN (sm.abbr, sm.name)
  WHERE f.case_kind = 'LCA' AND f.status_n = 'CERTIFIED' AND f.decision_year IN (2010, 2025)
),
tot AS (SELECT year, count(*) AS total FROM f GROUP BY 1),
st AS (
  SELECT f.state, f.year, count(*) AS n, count(*) * 100.0 / any_value(t.total) AS share
  FROM f JOIN tot t USING (year) GROUP BY f.state, f.year
),
top AS (SELECT state FROM st WHERE year = 2025 ORDER BY share DESC LIMIT 12)
SELECT a.state,
       a.n AS n_2010, a.share AS share_2010,
       b.n AS n_2025, b.share AS share_2025,
       b.share - a.share AS change_pp
FROM top
JOIN st a ON a.state = top.state AND a.year = 2010
JOIN st b ON b.state = top.state AND b.year = 2025
ORDER BY b.share DESC
