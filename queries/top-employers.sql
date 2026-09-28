-- Top 20 employers by certified H-1B applications, decision years 2021-2025.
-- Group on employer_key; label with the most frequent employer_name within the key (ties broken alphabetically).
WITH f AS (
  SELECT employer_key, employer_name
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA'
    AND status_n = 'CERTIFIED'
    AND decision_year BETWEEN 2021 AND 2025
    AND employer_key IS NOT NULL AND employer_key <> ''
),
names AS (
  SELECT employer_key, employer_name, count(*) AS n
  FROM f GROUP BY 1, 2
),
label AS (
  SELECT employer_key, arg_max(employer_name, (n, employer_name)) AS employer
  FROM names GROUP BY 1
),
tot AS (
  SELECT employer_key, count(*) AS applications FROM f GROUP BY 1
)
SELECT l.employer, t.applications, (SELECT count(*) FROM f) AS all_certified
FROM tot t JOIN label l USING (employer_key)
ORDER BY t.applications DESC, l.employer
LIMIT 20
