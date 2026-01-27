-- Migration: Fix coordinate columns format
-- Changes bigint to numeric(10,6) for proper lat/long storage

-- Fix net_register coordinates
ALTER TABLE net_register
  ALTER COLUMN net_lat TYPE numeric(10, 6) USING net_lat::numeric(10, 6),
  ALTER COLUMN net_long TYPE numeric(10, 6) USING net_long::numeric(10, 6);

-- Fix station_register coordinates (change scale from 0 to 6)
ALTER TABLE station_register
  ALTER COLUMN center_lat TYPE numeric(10, 6) USING center_lat::numeric(10, 6),
  ALTER COLUMN center_long TYPE numeric(10, 6) USING center_long::numeric(10, 6);
