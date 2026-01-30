-- HealthQueue+ Database Schema Verification and Migration
-- Run this to ensure your database schema matches the application expectations

-- ==========================================
-- STEP 1: Verify Current Schema
-- ==========================================

-- Check if patients table has JSONB vulnerabilities column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' 
  AND column_name = 'vulnerabilities';

-- If the above returns a row, you have the correct schema
-- If not, you need to migrate from old schema

-- ==========================================
-- STEP 2: Migration from Old Schema (if needed)
-- ==========================================

-- Only run this section if you have the old schema with separate vulnerability columns

-- Check if old columns exist
DO $$ 
BEGIN
  -- If old schema exists, migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'vulnerability_elderly'
  ) THEN
    RAISE NOTICE 'Old schema detected - migrating to JSONB format...';
    
    -- Add new JSONB column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name = 'vulnerabilities'
    ) THEN
      ALTER TABLE patients ADD COLUMN vulnerabilities JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Migrate data from old columns to JSONB
    UPDATE patients 
    SET vulnerabilities = jsonb_build_object(
      'elderly', COALESCE(vulnerability_elderly, false),
      'pregnant', COALESCE(vulnerability_pregnant, false),
      'disabled', COALESCE(vulnerability_disabled, false),
      'chronicCondition', COALESCE(vulnerability_chronic_condition, false)
    );
    
    -- Drop old columns (COMMENT OUT if you want to keep them for backup)
    -- ALTER TABLE patients DROP COLUMN IF EXISTS vulnerability_elderly;
    -- ALTER TABLE patients DROP COLUMN IF EXISTS vulnerability_pregnant;
    -- ALTER TABLE patients DROP COLUMN IF EXISTS vulnerability_disabled;
    -- ALTER TABLE patients DROP COLUMN IF EXISTS vulnerability_chronic_condition;
    
    RAISE NOTICE 'Migration completed successfully!';
  ELSE
    RAISE NOTICE 'Schema is already up to date (JSONB vulnerabilities column exists)';
  END IF;
END $$;

-- ==========================================
-- STEP 3: Verify All Required Tables Exist
-- ==========================================

-- Verify patients table
SELECT 
  COUNT(*) as patient_count,
  COUNT(DISTINCT department) as departments
FROM patients;

-- Verify prescriptions table
SELECT 
  COUNT(*) as prescription_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified,
  COUNT(CASE WHEN status = 'forwarded' THEN 1 END) as forwarded,
  COUNT(CASE WHEN status = 'dispensed' THEN 1 END) as dispensed
FROM prescriptions;

-- Verify receipts table
SELECT 
  COUNT(*) as receipt_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled
FROM receipts;

-- Verify token_counters table
SELECT * FROM token_counters;

-- ==========================================
-- STEP 4: Add Missing Indexes (if needed)
-- ==========================================

-- These improve query performance
CREATE INDEX IF NOT EXISTS idx_patients_department ON patients(department);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_token_number ON patients(token_number);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_receipts_patient_id ON receipts(patient_id);
CREATE INDEX IF NOT EXISTS idx_receipts_token_number ON receipts(token_number);

-- ==========================================
-- STEP 5: Verify Constraints and Foreign Keys
-- ==========================================

-- Check foreign key constraints
SELECT
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('patients', 'prescriptions', 'receipts')
  AND tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type;

-- ==========================================
-- STEP 6: Sample Data Test (Optional)
-- ==========================================

-- Test JSONB vulnerabilities query
SELECT 
  id,
  name,
  token_number,
  vulnerabilities,
  vulnerabilities->>'elderly' as is_elderly,
  vulnerabilities->>'pregnant' as is_pregnant
FROM patients
LIMIT 5;

-- Test prescription flow query
SELECT 
  p.token_number,
  p.name as patient_name,
  pr.diagnosis,
  pr.status as prescription_status,
  pr.medicines,
  r.status as receipt_status
FROM patients p
LEFT JOIN prescriptions pr ON p.prescription_id = pr.id
LEFT JOIN receipts r ON p.receipt_id = r.id
WHERE p.status = 'completed'
LIMIT 5;

-- ==========================================
-- STEP 7: Data Integrity Checks
-- ==========================================

-- Find orphaned prescriptions (patient doesn't exist)
SELECT pr.id, pr.token_number, pr.patient_name
FROM prescriptions pr
LEFT JOIN patients p ON pr.patient_id = p.id
WHERE p.id IS NULL;

-- Find orphaned receipts (patient doesn't exist)
SELECT r.id, r.token_number, r.patient_name
FROM receipts r
LEFT JOIN patients p ON r.patient_id = p.id
WHERE p.id IS NULL;

-- Find patients with prescriptions but no prescription_id link
SELECT p.id, p.token_number, p.name, pr.id as prescription_id
FROM patients p
INNER JOIN prescriptions pr ON pr.patient_id = p.id
WHERE p.prescription_id IS NULL;

-- ==========================================
-- STEP 8: Initialize Token Counters (if empty)
-- ==========================================

-- Initialize token counters if they don't exist
INSERT INTO token_counters (department, counter)
VALUES 
  ('general_medicine', 0),
  ('pediatrics', 0),
  ('orthopedics', 0),
  ('gynecology', 0)
ON CONFLICT (department) DO NOTHING;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================

-- Run this final query to confirm everything is working
SELECT 
  'patients' as table_name,
  COUNT(*) as row_count
FROM patients
UNION ALL
SELECT 
  'prescriptions',
  COUNT(*)
FROM prescriptions
UNION ALL
SELECT 
  'receipts',
  COUNT(*)
FROM receipts
UNION ALL
SELECT 
  'token_counters',
  COUNT(*)
FROM token_counters;

-- If all queries run successfully, your database is ready!
