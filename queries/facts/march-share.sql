-- March's share of H-1B applications (case_kind 'LCA', any status) by the calendar year of received_date.
-- October 2025 has very few applications in the file, so its count is reported next to September's.
SELECT count(*) FILTER (WHERE year(received_date) = 2016) AS received_2016, count(*) FILTER (WHERE year(received_date) = 2016 AND month(received_date) = 3) AS march_2016,
       count(*) FILTER (WHERE year(received_date) = 2025) AS received_2025, count(*) FILTER (WHERE year(received_date) = 2025 AND month(received_date) = 3) AS march_2025,
       count(*) FILTER (WHERE year(received_date) = 2016 AND month(received_date) = 3) * 1.0 / count(*) FILTER (WHERE year(received_date) = 2016) AS share_2016,
       count(*) FILTER (WHERE year(received_date) = 2025 AND month(received_date) = 3) * 1.0 / count(*) FILTER (WHERE year(received_date) = 2025) AS share_2025,
       count(*) FILTER (WHERE year(received_date) = 2025 AND month(received_date) = 9) AS sep_2025,
       count(*) FILTER (WHERE year(received_date) = 2025 AND month(received_date) = 10) AS oct_2025
FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet') WHERE case_kind = 'LCA' AND received_date IS NOT NULL AND year(received_date) IN (2016, 2025)
