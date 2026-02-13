-- Add band_size and is_external columns to bands table
-- Make string_id nullable for external bands

-- Step 1: Add new columns
ALTER TABLE bands ADD COLUMN band_size VARCHAR(2);
ALTER TABLE bands ADD COLUMN is_external BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Backfill band_size from band_string_register
UPDATE bands SET band_size = bsr.size
FROM band_string_register bsr
WHERE bands.string_id = bsr.string_id;

-- Step 3: Make band_size NOT NULL after backfill
ALTER TABLE bands ALTER COLUMN band_size SET NOT NULL;

-- Step 4: Make string_id nullable (external bands don't need a string register)
ALTER TABLE bands ALTER COLUMN string_id DROP NOT NULL;
