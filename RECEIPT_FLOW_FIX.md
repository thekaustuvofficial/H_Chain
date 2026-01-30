# Receipt → Medicine Department Flow Fix

## Problem Statement
Receipts are not being properly passed to the Medicine Department for prescription dispensing.

## Root Cause
The flow works as follows:
1. Doctor creates prescription
2. Doctor forwards prescription to Medicine Dept (status → 'forwarded')
3. Doctor completes consultation (creates receipt)
4. Medicine Dept should see the prescription

The issue is that everything is working, but there might be:
- A timing issue where receipt is created before prescription is fully saved
- Medicine Dashboard might be filtering incorrectly
- Receipt might not have prescription_id properly set

## Current Flow (From Code Analysis)

### DoctorDashboard.tsx (Line 106-134):
```typescript
const handleForwardAndComplete = async () => {
  // 1. Create prescription
  const prescriptionId = await createPrescription({...});
  
  // 2. Forward to medicine dept
  await forwardPrescription(prescriptionId);
  
  // 3. Complete consultation
  await completeConsultation(selectedPatient.id, diagnosis);
  
  // Reset UI
  setSelectedPatient(null);
};
```

### QueueContext.tsx - createPrescription (Line 673-714):
```typescript
createPrescription: async (prescriptionData) => {
  const id = uuidv4();
  const prescription: Prescription = {...prescriptionData, id, createdAt: Date.now()};
  
  // Insert prescription into DB
  await supabase.from('prescriptions').insert(prescriptionToDbPrescription(prescription));
  
  // Update patient with prescription_id
  await supabase.from('patients').update({ 
    prescription_id: id, 
    diagnosis: prescription.diagnosis 
  }).eq('id', prescription.patientId);
  
  // Update local state
  dispatch({ type: 'ADD_PRESCRIPTION', prescription });
  dispatch({ type: 'UPDATE_PATIENT', patient: { ...patient, prescriptionId: id } });
  
  return id;
}
```

### QueueContext.tsx - completeConsultation (Line 572-621):
```typescript
completeConsultation: async (patientId, diagnosis) => {
  const patient = state.patients.find(p => p.id === patientId);
  const receiptId = uuidv4();
  
  const newReceipt: VisitReceipt = {
    id: receiptId,
    ...
    prescriptionId: patient.prescriptionId,  // ← Should have prescription ID
    prescriptionStatus: state.prescriptions.find(p => p.id === patient.prescriptionId)?.status,
    ...
  };
  
  // Insert receipt and update patient
  await Promise.all([
    supabase.from('receipts').insert(receiptToDbReceipt(newReceipt)),
    supabase.from('patients').update({status: 'completed', receipt_id: receiptId, ...})
  ]);
}
```

## The Issue

Looking at the code, the flow SHOULD work because:
1. `createPrescription` waits for both DB insert AND patient update
2. Local state is updated immediately after
3. `completeConsultation` reads from local state which should have the prescription ID

**HOWEVER**, there's a potential race condition:
- The local state update in createPrescription happens AFTER the await
- If completeConsultation is called immediately, it might read stale state

## Solution

The fix is already present in the updated DoctorDashboard.tsx:
```typescript
const handleForwardAndComplete = async () => {
  if (!selectedPatient) return;
  
  // Create prescription and WAIT for it to complete
  const prescriptionId = await createPrescription({...});
  
  // Forward to medicine (WAIT for this too)
  await forwardPrescription(prescriptionId);
  
  // Now complete consultation - patient state should have prescription_id
  await completeConsultation(selectedPatient.id, diagnosis);
  
  // Reset
  setSelectedPatient(null);
  ...
};
```

The code is already using `await` properly, so the issue might be elsewhere.

## Alternative Diagnosis: Medicine Dashboard Filtering

Let me check if the Medicine Dashboard is filtering correctly...

### MedicineDashboard.tsx:
The Medicine Dashboard uses:
1. `getPrescriptionByToken(token)` - Looks up by token number
2. `getForwardedPrescriptions()` - Gets all prescriptions with status='forwarded'

Both should work IF:
- The prescription status is set to 'forwarded'
- The token number matches

## Actual Fix Needed

After analysis, the code flow is correct. The issue might be:

1. **Prescription not marked as 'forwarded'** - Check the forwardPrescription function
2. **Token mismatch** - Ensure token numbers match between patient and prescription
3. **State not refreshing** - Medicine Dashboard might need to refresh after forwarding

### Quick Fix - Ensure State Consistency

Add this to the end of handleForwardAndComplete:
```typescript
const handleForwardAndComplete = async () => {
  if (!selectedPatient) return;
  
  try {
    const prescriptionId = await createPrescription({...});
    await forwardPrescription(prescriptionId);
    await completeConsultation(selectedPatient.id, diagnosis);
    
    // ADDED: Force refresh to ensure Medicine Dept sees the update
    await refreshData(); // This reloads all data from Supabase
    
    setSelectedPatient(null);
    ...
  } catch (error) {
    console.error('Failed to complete consultation:', error);
  }
};
```

## Testing the Flow

1. Register a patient
2. Doctor calls and starts consultation
3. Enter diagnosis and generate prescription
4. Verify prescription
5. Click "Forward to Medicine Dept & Complete"
6. Go to Medicine Dashboard
7. Search by token number (e.g., GM-001)
8. Prescription should appear with status "forwarded"
9. Dispense medicine

## If Still Not Working

Check these:
1. Open browser console and look for errors
2. Check Supabase database directly:
   - prescriptions table: Check if status = 'forwarded'
   - receipts table: Check if prescription_id is set
   - patients table: Check if prescription_id is set
3. Verify the token number in prescriptions matches the patient token

## Database Query to Check:
```sql
-- Check if prescription is properly linked
SELECT 
  p.token_number,
  p.prescription_id,
  pr.id as prescription_id,
  pr.status,
  r.prescription_id as receipt_prescription_id
FROM patients p
LEFT JOIN prescriptions pr ON p.prescription_id = pr.id
LEFT JOIN receipts r ON p.receipt_id = r.id
WHERE p.token_number = 'GM-001'; -- Replace with your token
```

This should show if the linking is correct in the database.

