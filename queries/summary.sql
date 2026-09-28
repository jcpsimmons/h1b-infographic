-- Headline totals for the hero. Every case on file in LCA-PERM/filing_current (one row per case, final determination).
-- "Certified status" counts CERTIFIED, CERTIFIEDWITHDRAWN and CERTIFIEDEXPIRED.
-- employer_keys is a normalized-name grouping hint, not a count of distinct legal entities.
SELECT count(*) AS cases,
       count(*) FILTER (WHERE status_n LIKE 'CERTIFIED%') AS certified_status,
       count(*) FILTER (WHERE status_n = 'DENIED') AS denied,
       count(DISTINCT employer_key) AS employer_keys,
       min(decision_year) AS first_year,
       max(decision_year) AS last_year
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
