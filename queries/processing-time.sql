-- Calendar days from received_date to decision_date, by calendar year of decision, 2010-2025.
-- case_kind = 'LCA' is the post-April-2009 LCA form (>99.9% H-1B). Certified = status_n 'CERTIFIED' only
-- (CERTIFIEDWITHDRAWN and WITHDRAWN are excluded); denied = status_n 'DENIED'.
-- Rows with a null date or a negative duration are dropped from the medians and counted in dropped_*.
-- Zero-day durations (decided the day received) are valid and kept.
WITH base AS (
  SELECT decision_year AS year, status_n,
         date_diff('day', received_date, decision_date) AS days
  FROM read_parquet('{{DATA}}/LCA-PERM/data/filing_current/*.parquet')
  WHERE case_kind = 'LCA'
    AND status_n IN ('CERTIFIED', 'DENIED')
    AND decision_year BETWEEN 2010 AND 2025
)
SELECT year,
  quantile_cont(days, 0.5) FILTER (WHERE status_n = 'CERTIFIED' AND days >= 0) AS certified_median,
  quantile_cont(days, 0.9) FILTER (WHERE status_n = 'CERTIFIED' AND days >= 0) AS certified_p90,
  quantile_cont(days, 0.5) FILTER (WHERE status_n = 'DENIED' AND days >= 0) AS denied_median,
  count(*) FILTER (WHERE status_n = 'CERTIFIED' AND days >= 0) AS certified_n,
  count(*) FILTER (WHERE status_n = 'DENIED' AND days >= 0) AS denied_n,
  count(*) FILTER (WHERE days IS NULL OR days < 0) AS dropped
FROM base
GROUP BY 1
ORDER BY 1
