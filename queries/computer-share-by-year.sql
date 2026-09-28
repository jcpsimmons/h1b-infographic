-- Share of certified H-1B applications by SOC major group (first two digits of soc_code), decision years 2010-2025.
-- case_kind = 'LCA' (post-April-2009 form, >99.9% H-1B); certified = status_n 'CERTIFIED'.
-- soc_code values not shaped like 'NN-...' (mostly 2011-2012 spreadsheet artifacts such as '41599') cannot be
-- assigned to a group. They are kept in the denominator as their own group 'unreadable' rather than dropped:
-- in 2012 about six in ten of them carry 'manager' in the job title, so dropping them would understate Management.
-- Groups: 15 plus the five largest other major groups over 2010-2025; everything else is 'Other'.
-- Group names: BLS 2018 SOC major groups, https://www.bls.gov/soc/2018/major_groups.htm
WITH base AS (
  SELECT decision_year AS year,
         CASE WHEN regexp_matches(trim(soc_code), '^[0-9]{2}-') THEN left(trim(soc_code), 2) ELSE 'unreadable' END AS grp
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED'
    AND decision_year BETWEEN 2010 AND 2025
),
top5 AS (
  SELECT grp FROM base WHERE grp NOT IN ('15', 'unreadable') GROUP BY 1 ORDER BY count(*) DESC, grp LIMIT 5
),
names(grp, name) AS (VALUES
  ('11','Management'), ('13','Business and Financial Operations'), ('15','Computer and Mathematical'),
  ('17','Architecture and Engineering'), ('19','Life, Physical, and Social Science'),
  ('25','Educational Instruction and Library'), ('29','Healthcare Practitioners and Technical'),
  ('unreadable','Code missing or unreadable')),
lab AS (
  SELECT year, CASE WHEN grp IN ('15', 'unreadable') OR grp IN (SELECT grp FROM top5) THEN grp ELSE 'other' END AS g
  FROM base
),
cnt AS (SELECT year, g, count(*) AS applications FROM lab GROUP BY 1, 2),
tot AS (SELECT year, sum(applications)::BIGINT AS total FROM cnt GROUP BY 1)
SELECT c.year, c.g AS group_code, coalesce(n.name, 'Other') AS group_name,
  c.applications, t.total, round(100.0 * c.applications / t.total, 2) AS share
FROM cnt c JOIN tot t USING (year) LEFT JOIN names n ON n.grp = c.g
ORDER BY c.year, c.g
