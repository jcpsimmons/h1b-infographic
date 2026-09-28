-- Share of certified H-1B applications (case_kind 'LCA', status_n 'CERTIFIED') whose primary worksite address key
-- matches an EPA-registered underground storage tank facility with at least one open tank, by decision year 2020-2025 (worksite_addr is blank before 2019 and only 16% populated in 2019).
-- Address keys come from LCA-PERM worksite_addr_key (joined on addr, city, state); an empty or missing key is
-- unresolvable and is counted separately, never as a non-match. The share is over applications with a resolvable key.
WITH fuel AS (
  SELECT DISTINCT addr_key AS akey
  FROM read_parquet('{{DATA}}/FUEL-PUMPS/data/facility/*.parquet')
  WHERE open_usts > 0 AND addr_key <> ''
),
wk AS (
  SELECT addr, city, st, akey
  FROM read_parquet('{{DATA}}/LCA-PERM/data/worksite_addr_key/*.parquet')
  WHERE akey <> ''
),
f AS (
  SELECT decision_year AS year, naics, worksite_addr, worksite_city, worksite_state
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2020 AND 2025
)
SELECT f.year,
       count(*) AS certified,
       count(wk.akey) AS resolvable,
       count(*) - count(wk.akey) AS unresolvable,
       count(fuel.akey) AS tank_matches,
       count(fuel.akey) FILTER (WHERE substr(f.naics, 1, 3) IN ('447', '457')) AS tank_matches_gas_naics,
       round(100.0 * count(fuel.akey) / count(wk.akey), 3) AS match_pct
FROM f
LEFT JOIN wk ON wk.addr = f.worksite_addr AND wk.city = f.worksite_city AND wk.st = f.worksite_state
LEFT JOIN fuel ON fuel.akey = wk.akey
GROUP BY 1
ORDER BY 1
