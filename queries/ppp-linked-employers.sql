-- Employers with at least one certified H-1B application (case_kind LCA, status CERTIFIED, decision years 2015-2025)
-- that the SBA crosswalk apparently matches to PPP loan records (normalized name + state match, not proof of identity).
-- Kept: PPP rows only, NOT person_like (personal-name matches collide heavily and are dropped), and match_key_freq <= 2
-- (names shared by three or more matched loans are generic or franchise names, e.g. one employer_key absorbing dozens of
-- separate borrowers, so they are dropped; at most two loans per name+state is the distinctive-name rule in the crosswalk docs).
-- An employer (employer_key) is placed in one bracket by the SUM of its matched PPP loan amounts.
-- Brackets: under 50k, 50k-150k, 150k-350k, 350k-1M, 1M and over (lower bound inclusive).
WITH h1b AS (
  SELECT DISTINCT employer_key
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2015 AND 2025
),
ppp AS (
  SELECT employer_key, count(*) AS loans, sum(try_cast(approval_amount AS DOUBLE)) AS dollars
  FROM read_parquet('{{DATA}}/SBA/CROSSWALK/data/match/*.parquet')
  WHERE sba_program = 'PPP' AND NOT person_like AND match_key_freq <= 2 AND try_cast(approval_amount AS DOUBLE) > 0
  GROUP BY 1
),
j AS (
  SELECT p.*,
    CASE WHEN dollars < 50000 THEN 1 WHEN dollars < 150000 THEN 2 WHEN dollars < 350000 THEN 3
         WHEN dollars < 1000000 THEN 4 ELSE 5 END AS ord
  FROM ppp p JOIN h1b USING (employer_key)
)
SELECT ord,
  CASE ord WHEN 1 THEN 'Under $50K' WHEN 2 THEN '$50K to $150K' WHEN 3 THEN '$150K to $350K'
           WHEN 4 THEN '$350K to $1M' ELSE '$1M and over' END AS bracket,
  count(*) AS employers, sum(loans)::BIGINT AS loans, round(sum(dollars)) AS dollars
FROM j GROUP BY 1, 2 ORDER BY 1
