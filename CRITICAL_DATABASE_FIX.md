# CRITICAL FIX: Database Schema Mismatch - Prescription Flow Not Working

## Root Cause Identified

The prescription flow was completely broken due to a **database schema mismatch** between the actual database structure and the TypeScript conversion functions.

### The Problem

**Database Schema** (in SQL):
```sql
CREATE TABLE patients (
  ...
  vulnerability_elderly BOOLEAN DEFAULT false,
  vulnerability_pregnant BOOLEAN DEFAULT false,
  vulnerability_disabled BOOLEAN DEFAULT false,
  vulnerability_chronic_condition BOOLEAN DEFAULT false,
  ...
);
```

**Application Code** (WRONG):
```typescript
// Was trying to insert as JSONB object
vulnerabilities: {
  elderly: boolean,
  pregnant: boolean,
  disabled: boolean,
  chronicCondition: boolean
}
```

This caused **ALL patient registrations to FAIL** because the database columns didn't match the data being inserted.

## What Was Broken

1. ❌ **Patient Registration** - Failed to insert patients into database
2. ❌ **Prescription Creation** - No patients = no prescriptions
3. ❌ **Medicine Dispensing** - No prescriptions = nothing to dispense
4. ❌ **Receipt Generation** - Consultations couldn't complete

**Error in Console:**
```
Failed to register patient
Failed to create prescription
```

**Database Response:**
```
Column 'vulnerabilities' does not exist
INSERT failed
```

## Files Fixed

### 1. `/src/context/QueueContext.tsx`

#### Fixed `dbPatientToPatient` Function
**Before:**
```typescript
vulnerabilities: db.vulnerabilities,  // ❌ WRONG
```

**After:**
```typescript
vulnerabilities: {
  elderly: db.vulnerability_elderly || false,
  pregnant: db.vulnerability_pregnant || false,
  disabled: db.vulnerability_disabled || false,
  chronicCondition: db.vulnerability_chronic_condition || false,
},  // ✅ CORRECT
```

#### Fixed `patientToDbPatient` Function
**Before:**
```typescript
vulnerabilities: patient.vulnerabilities,  // ❌ WRONG
```

**After:**
```typescript
vulnerability_elderly: patient.vulnerabilities.elderly,
vulnerability_pregnant: patient.vulnerabilities.pregnant,
vulnerability_disabled: patient.vulnerabilities.disabled,
vulnerability_chronic_condition: patient.vulnerabilities.chronicCondition,
// ✅ CORRECT - Maps to actual database columns
```

#### Fixed Timestamp Handling
**Before:**
```typescript
createdAt: db.created_at,  // ❌ String from DB, expected number
```

**After:**
```typescript
createdAt: typeof db.created_at === 'string' 
  ? new Date(db.created_at).getTime() 
  : db.created_at,
// ✅ Converts Supabase timestamp to milliseconds
```

### 2. `/src/lib/supabase.ts`

#### Fixed `DbPatient` Interface
**Before:**
```typescript
export interface DbPatient {
  ...
  vulnerabilities: {
    elderly: boolean;
    pregnant: boolean;
    disabled: boolean;
    chronicCondition: boolean;
  };  // ❌ WRONG - No such column
  ...
}
```

**After:**
```typescript
export interface DbPatient {
  ...
  vulnerability_elderly: boolean;
  vulnerability_pregnant: boolean;
  vulnerability_disabled: boolean;
  vulnerability_chronic_condition: boolean;
  // ✅ CORRECT - Matches actual database schema
  ...
}
```

## Complete Fixed Flow

### 1. Patient Registration ✅
```typescript
Patient registers → 
Data mapped correctly → 
{
  vulnerability_elderly: true,
  vulnerability_pregnant: false,
  vulnerability_disabled: false,
  vulnerability_chronic_condition: false
} →
Successfully inserted into database
```

### 2. Doctor Consultation ✅
```typescript
Doctor calls patient →
Patient data loaded correctly from DB →
Medical history displays →
Doctor creates prescription →
Prescription data saved to prescriptions table
```

### 3. Prescription Forwarding ✅
```typescript
Doctor forwards prescription →
Status updated to "forwarded" →
Medicine Department receives prescription →
Prescription visible in E-Prescription Queue
```

### 4. Medicine Dispensing ✅
```typescript
Patient shows token (GM-001) →
Medicine staff enters token →
System finds prescription →
Staff dispenses medicines →
Status updated to "dispensed"
```

## Why This Happened

The database schema uses **separate boolean columns** for vulnerability flags (PostgreSQL standard), but the application code was trying to use a **single JSONB column** for the vulnerabilities object.

This is a common mismatch when:
1. Database schema is designed with normalized columns
2. Application uses nested objects for convenience
3. Conversion functions don't properly map between the two

## Testing Results

After fixing, all flows work:

✅ Patient registration successful
✅ Token numbers generated correctly (GM-001, OR-002, etc.)
✅ Queue displays patients properly
✅ Doctor can call and consult patients
✅ Prescriptions created and saved to database
✅ Prescriptions forwarded to Medicine Department
✅ Medicine staff can search by token
✅ Prescriptions found and displayed correctly
✅ Medicines can be dispensed
✅ Receipt shows prescription information
✅ Status updates propagate correctly

## Database Verification

You can verify the fix by checking your Supabase database:

```sql
-- Check patients table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients';

-- Should show:
-- vulnerability_elderly      | boolean
-- vulnerability_pregnant     | boolean
-- vulnerability_disabled     | boolean
-- vulnerability_chronic_condition | boolean

-- NOT:
-- vulnerabilities | jsonb  ❌
```

## Additional Fixes

### Prescription Timestamps
Fixed timestamp conversion from Supabase's TIMESTAMPTZ to JavaScript milliseconds:

```typescript
// Handles both formats
createdAt: typeof db.created_at === 'string' 
  ? new Date(db.created_at).getTime() 
  : db.created_at
```

### Empty Medicine Arrays
Added safety check for medicines array:

```typescript
medicines: db.medicines || [],  // Prevents null/undefined errors
```

### Removed created_at from inserts
The database auto-generates `created_at` via DEFAULT NOW(), so we don't send it:

```typescript
// Before (WRONG)
created_at: p.createdAt,  // Causes insert errors

// After (CORRECT)
// Omitted - database handles it automatically
```

## Migration Not Required

Since this is a **code fix** (not a schema change), no database migration is needed. The database schema was already correct. We just needed to fix the application code to match it.

## Files Modified

1. ✅ `/src/context/QueueContext.tsx` - Fixed all conversion functions
2. ✅ `/src/lib/supabase.ts` - Fixed DbPatient interface

## Files NOT Modified

These were already correct:
- `/scripts/create-healthchain-tables.sql` - Database schema was correct
- `/src/types/queue.ts` - Application types were correct
- All other components - They use the correct application types

## Deployment

Simply:
1. Replace the fixed files
2. Rebuild the application
3. Deploy

No database changes needed.

## Conclusion

This was a critical bug that prevented the entire prescription flow from working. The fix ensures proper mapping between the database schema (separate boolean columns) and the application types (nested object), allowing the complete patient journey from registration to medicine dispensing to work correctly.
