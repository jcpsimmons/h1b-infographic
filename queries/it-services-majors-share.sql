-- Share of certified H-1B applications (case_kind='LCA', status_n='CERTIFIED') per decision year, 2010-2025,
-- filed by the IT-services firms compiled in STAFFING-MAJORS (gis_firm). Joined to filing_current on case_number.
-- The 8 firms with the most certified applications over the window are shown; the rest of the compiled firms are 'Other majors'.
-- Denominator: all certified LCA applications in filing_current that year.
WITH fc AS (
  SELECT case_number, decision_year
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2010 AND 2025
),
tot AS (SELECT decision_year, count(*) AS total FROM fc GROUP BY 1),
m AS (
  SELECT DISTINCT case_number, gis_firm
  FROM read_parquet('{{DATA}}/STAFFING-MAJORS/data/filing/*.parquet')
  WHERE gis_firm IS NOT NULL
),
j AS (SELECT fc.decision_year, m.gis_firm FROM fc JOIN m USING (case_number)),
top8 AS (SELECT gis_firm FROM j GROUP BY 1 ORDER BY count(*) DESC, 1 LIMIT 8),
g AS (
  SELECT decision_year, CASE WHEN gis_firm IN (SELECT gis_firm FROM top8) THEN gis_firm ELSE 'other_majors' END AS firm, count(*) AS apps
  FROM j GROUP BY 1, 2
)
SELECT g.decision_year AS year, g.firm, g.apps, tot.total,
       round(100.0 * g.apps / tot.total, 3) AS share_pct
FROM g JOIN tot USING (decision_year)
ORDER BY 1, 2
