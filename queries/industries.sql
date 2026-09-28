-- Top 12 industries (NAICS 2-digit sector, as declared by the employer) for certified H-1B applications decided 2023-2025.
-- NAICS was revised in 2022 and filings in this window use both the 2017 and 2022 versions. Codes at 3 digits and below
-- moved between the versions (publishing 511 -> 513, retail 454 split across 455/459, 518/519 redefined), but the 2-digit
-- sectors below hold the same broad activities in both, so grouping on the sector avoids splitting an industry by era.
-- Sector codes: 31-33 (Manufacturing), 44-45 (Retail Trade) and 48-49 (Transportation and Warehousing) are combined.
-- Rows whose naics does not start with a valid sector code (a few hundred typos) are left out of numerator and denominator.
-- Sector titles: https://www.census.gov/naics/2022NAICS/2-6%20digit_2022_Codes.xlsx
WITH sectors(code, sector) AS (VALUES
  ('11','11'),('21','21'),('22','22'),('23','23'),('31','31-33'),('32','31-33'),('33','31-33'),('42','42'),
  ('44','44-45'),('45','44-45'),('48','48-49'),('49','48-49'),('51','51'),('52','52'),('53','53'),('54','54'),
  ('55','55'),('56','56'),('61','61'),('62','62'),('71','71'),('72','72'),('81','81'),('92','92')
), f AS (
  SELECT s.sector
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') fc
  JOIN sectors s ON s.code = left(trim(fc.naics), 2)
  WHERE fc.case_kind = 'LCA' AND fc.status_n = 'CERTIFIED' AND fc.decision_year BETWEEN 2023 AND 2025
), tot AS (SELECT count(*) AS total FROM f)
SELECT sector AS code, count(*) AS certified, round(100.0 * count(*) / any_value(total), 2) AS share_pct, any_value(total) AS total
FROM f, tot
GROUP BY sector
ORDER BY certified DESC, sector
LIMIT 12
