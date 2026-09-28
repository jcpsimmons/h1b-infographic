-- Share of certified H-1B applications decided 2023-2025 (case_kind 'LCA', status_n CERTIFIED) whose occupation code is 15-1252.00 (Software Developers).
-- Seven-character codes ('15-1252') are completed with '.00' first, so both spellings of the same code are counted.
SELECT count(*) FILTER (WHERE CASE WHEN length(soc_code) = 7 THEN soc_code || '.00' ELSE soc_code END = '15-1252.00') AS software_developers,
       count(*) AS certified_applications,
       count(*) FILTER (WHERE CASE WHEN length(soc_code) = 7 THEN soc_code || '.00' ELSE soc_code END = '15-1252.00') * 1.0 / count(*) AS share
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2023 AND 2025
