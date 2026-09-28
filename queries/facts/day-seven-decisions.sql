-- Share of certified H-1B applications (case_kind 'LCA', status_n CERTIFIED) decided exactly 7 calendar days after received_date.
WITH x AS (
  SELECT decision_year BETWEEN 2020 AND 2025 AS late, date_diff('day', received_date, decision_date) = 7 AS d7
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') WHERE case_kind = 'LCA' AND status_n = 'CERTIFIED' AND decision_year BETWEEN 2010 AND 2025
)
SELECT count(*) FILTER (WHERE NOT late) AS certified_2010_2019, count(*) FILTER (WHERE NOT late AND d7) AS day7_2010_2019,
       count(*) FILTER (WHERE late) AS certified_2020_2025, count(*) FILTER (WHERE late AND d7) AS day7_2020_2025,
       count(*) FILTER (WHERE NOT late AND d7) * 1.0 / count(*) FILTER (WHERE NOT late) AS share_2010_2019,
       count(*) FILTER (WHERE late AND d7) * 1.0 / count(*) FILTER (WHERE late) AS share_2020_2025
FROM x
