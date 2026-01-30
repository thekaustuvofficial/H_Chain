# Testing Guide - Prescription & Reports Fix

## 🧪 Complete Test Suite

### Prerequisites
1. Supabase project is running
2. Database tables are created (use provided schema)
3. Environment variables are set in `.env`
4. Application is running: `npm run dev` or `bun dev`

---

## Test 1: Database Schema Compatibility ✅

### Goal
Verify the code handles both old and new database schemas correctly.

### Steps
1. **Run verification script:**
   ```bash
   # In Supabase SQL Editor, run:
   # /database-verification.sql
   ```

2. **Check vulnerabilities column:**
   ```sql
   SELECT 
     token_number,
     name,
     vulnerabilities
   FROM patients
   LIMIT 5;
   ```

3. **Expected Result:**
   - `vulnerabilities` column exists as JSONB
   - Format: `{"elderly": false, "pregnant": true, ...}`
   - No errors when querying

### Pass Criteria
- ✅ JSONB column exists
- ✅ Data is properly formatted
- ✅ Application loads without errors

---

## Test 2: Patient Registration Flow 🏥

### Goal
Verify patient registration saves data correctly to database.

### Steps
1. Go to `http://localhost:5173/register`
2. Fill in patient details:
   - Name: "Test Patient"
   - Age: 65
   - Department: "General Medicine"
   - Symptom: "Fever"
   - Check "Elderly" vulnerability
   - Visit Type: "Routine"
3. Click "Register Patient"

### Expected Behavior
1. Success toast appears
2. Token number generated (e.g., "GM-001")
3. Redirect to queue view
4. Patient appears in queue

### Verification Query
```sql
SELECT 
  token_number,
  name,
  age,
  department,
  vulnerabilities,
  status
FROM patients
WHERE name = 'Test Patient';
```

### Pass Criteria
- ✅ Patient record created in database
- ✅ `vulnerabilities` JSONB has `{"elderly": true}`
- ✅ Token number follows format: `DEPT_PREFIX-###`
- ✅ Status is "waiting"

---

## Test 3: Doctor Prescription Flow 💊

### Goal
Test complete prescription creation and forwarding.

### Steps

**Part A: Create Prescription**
1. Go to `http://localhost:5173/doctor`
2. Find the patient in queue (GM-001)
3. Click "Start Consultation"
4. Status changes to "consultation"
5. Click "End Consultation & Create Prescription"
6. Enter diagnosis: "Viral Fever"
7. Click "Generate AI Prescription" or add manually:
   - Medicine: "Paracetamol 500mg"
   - Dosage: "500mg"
   - Frequency: "Twice daily"
   - Duration: "3 days"
   - Instructions: "Take after meals"
8. Click "Save Prescription"

**Part B: Verify Prescription**
9. Prescription appears with status "pending"
10. Click "Verify & Forward"
11. Status changes to "verified" → "forwarded"

### Expected Behavior
1. Prescription created in database
2. Patient gets prescription_id
3. Receipt generated automatically
4. Prescription appears in Medicine queue

### Verification Queries
```sql
-- Check prescription
SELECT 
  id,
  token_number,
  patient_name,
  diagnosis,
  medicines,
  status,
  ai_generated,
  doctor_verified
FROM prescriptions
WHERE token_number = 'GM-001';

-- Check patient link
SELECT 
  token_number,
  name,
  prescription_id,
  diagnosis,
  status
FROM patients
WHERE token_number = 'GM-001';

-- Check receipt
SELECT 
  token_number,
  patient_name,
  prescription_id,
  prescription_status,
  status,
  scan_count
FROM receipts
WHERE token_number = 'GM-001';
```

### Pass Criteria
- ✅ Prescription status: "forwarded"
- ✅ `medicines` JSONB contains medicine details
- ✅ Patient status: "completed"
- ✅ Receipt created with prescription link
- ✅ Receipt status: "active"

---

## Test 4: Medicine Dispensing Flow 💉

### Goal
Test medicine department can find and dispense prescriptions.

### Steps

**Part A: Token Lookup**
1. Go to `http://localhost:5173/medicine`
2. Enter token number: "GM-001"
3. Click search button (magnifying glass)

**Part B: Verify Display**
4. Check that prescription shows:
   - Badge: "Ready to Dispense"
   - Patient name
   - Diagnosis
   - List of medicines with dosage, frequency, duration
   - Green "Dispense Medicines" button

**Part C: E-Prescription Queue**
5. Check right panel shows same prescription
6. Click on queue item
7. Verify it auto-fills token lookup

**Part D: Dispense**
8. Click "Dispense Medicines" button
9. Confirmation dialog appears
10. Shows patient name, token, and medicine list
11. Click "Confirm Dispensed"

**Part E: Verify Completion**
12. Prescription disappears from queue
13. Appears in "Recently Dispensed" section
14. Try searching same token again
15. Should show error: "ALREADY DISPENSED"

### Expected Behavior
1. Token lookup finds prescription instantly
2. All details match reference screenshots
3. Dispensing updates status to "dispensed"
4. Cannot dispense same prescription twice
5. Receipt prescription_status updates

### Verification Queries
```sql
-- Check prescription status
SELECT 
  token_number,
  status,
  dispensed_at
FROM prescriptions
WHERE token_number = 'GM-001';

-- Check receipt status
SELECT 
  token_number,
  prescription_status
FROM receipts
WHERE token_number = 'GM-001';
```

### Pass Criteria
- ✅ Prescription found by token
- ✅ UI matches reference screenshots
- ✅ Dispensing changes status to "dispensed"
- ✅ `dispensed_at` timestamp set
- ✅ Fraud prevention works (can't dispense twice)
- ✅ Receipt updated to "prescription_status: dispensed"

---

## Test 5: Reports Generation 📊

### Goal
Verify reports page displays accurate statistics and can export data.

### Steps

**Part A: Access Reports**
1. Go to `http://localhost:5173/reports`
2. Verify page loads without errors

**Part B: Check Statistics**
3. Verify "Total Patients" card shows correct count
4. Verify "Prescriptions" card shows correct numbers
5. Check "Avg Wait Time" is calculated
6. Check "Emergency Cases" count

**Part C: Test Filters**
7. Change "Time Period" to "Weekly"
8. Statistics should update
9. Change "Department" to "General Medicine"
10. Statistics should filter to that department only
11. Change back to "All Departments"

**Part D: Check Department Performance**
12. Scroll to "Department Performance" section
13. Each department should show:
    - Patient count
    - Completed count
    - Prescriptions count
    - Dispensed count
    - Completion progress bar

**Part E: Check Prescription Pipeline**
14. Verify "Pending", "Forwarded", "Dispensed" counts
15. Numbers should match actual prescription statuses

**Part F: Export Report**
16. Click "Generate" button
17. JSON file downloads
18. Open file and verify it contains:
    - Report metadata
    - All statistics
    - Timestamp

### Expected Statistics (after Test 1-4)
- Total Patients: 1
- Completed Patients: 1
- Total Prescriptions: 1
- Dispensed Prescriptions: 1
- Emergency Cases: 0

### Verification
```sql
-- Verify counts match dashboard
SELECT 
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM patients WHERE status = 'completed') as completed,
  (SELECT COUNT(*) FROM prescriptions) as total_prescriptions,
  (SELECT COUNT(*) FROM prescriptions WHERE status = 'dispensed') as dispensed;
```

### Pass Criteria
- ✅ Reports page loads successfully
- ✅ All statistics display correctly
- ✅ Filters work (time period, department)
- ✅ Department breakdown accurate
- ✅ JSON export works
- ✅ Exported data matches UI
- ✅ No console errors

---

## Test 6: Navigation & UI Consistency 🧭

### Goal
Verify all navigation links work and UI is consistent.

### Steps
1. Click each navigation link:
   - Home → Landing page
   - Register → Registration form
   - Queue → Queue display
   - Staff → Staff dashboard
   - Doctor → Doctor dashboard
   - Medicine → Medicine department
   - **Reports → Reports page** (NEW)

2. Check header on each page:
   - Logo visible
   - All nav links present
   - Active link highlighted
   - Offline toggle works

3. Test mobile responsive:
   - Resize browser to mobile width
   - Hamburger menu appears
   - All links accessible in mobile menu

### Pass Criteria
- ✅ All routes work
- ✅ Reports link added to navigation
- ✅ No broken links
- ✅ Consistent header across pages
- ✅ Mobile menu functional

---

## Test 7: Error Handling 🚨

### Goal
Verify proper error handling and user feedback.

### Steps

**Test A: Invalid Token**
1. Go to Medicine dashboard
2. Search for "INVALID-999"
3. Should show: "No prescription found for this token number"

**Test B: Already Dispensed**
1. Try to dispense an already dispensed prescription
2. Should show: "⚠️ ALREADY DISPENSED: This prescription has already been fulfilled!"

**Test C: Not Yet Forwarded**
1. Create a prescription but don't forward it
2. Try to search for it in Medicine
3. Should show: "This prescription has not been forwarded to medicine department yet"

**Test D: Network Offline**
1. Click offline toggle in header
2. Try to register a patient
3. Should show offline warning

### Pass Criteria
- ✅ Clear error messages
- ✅ No crashes on errors
- ✅ User feedback for all actions
- ✅ Proper validation

---

## Test 8: Multi-Patient Workflow 👥

### Goal
Test system with multiple patients across departments.

### Steps
1. Register 4 patients (one per department):
   - GM-001: General Medicine, Fever
   - PD-001: Pediatrics, Vaccination
   - OR-001: Orthopedics, Joint Pain
   - GY-001: Gynecology, Prenatal Checkup

2. For each patient:
   - Start consultation
   - Create prescription
   - Forward to medicine
   - Dispense medicines

3. Check Reports page:
   - Total: 4 patients
   - Each department: 1 patient
   - All prescriptions dispensed
   - Progress bars at 100%

4. Filter by each department:
   - Verify stats update correctly

### Pass Criteria
- ✅ All departments work independently
- ✅ Token numbering correct per department
- ✅ Reports accurately reflect all data
- ✅ No interference between departments

---

## Test 9: Performance & Load 🏃‍♂️

### Goal
Verify system handles multiple records efficiently.

### Steps
1. Register 20+ patients
2. Create prescriptions for all
3. Forward and dispense all
4. Check Reports page loads quickly
5. No lag in UI
6. Database queries efficient

### Expected Behavior
- Page loads in < 2 seconds
- No UI freezing
- Smooth animations
- Quick searches

### Pass Criteria
- ✅ Fast page loads
- ✅ Smooth interactions
- ✅ No memory leaks
- ✅ Efficient database queries

---

## Test 10: Receipt Scanning (Integration) 🎫

### Goal
Verify receipt scanning integrates with medicine dispensing.

### Steps
1. Complete a patient consultation with prescription
2. Note the receipt ID from patient record
3. Go to `/receipt/:id` page
4. Scan receipt once → OK
5. Scan receipt again → Fraud warning
6. Verify prescription shows as dispensed on receipt

### Pass Criteria
- ✅ Receipt displays all details
- ✅ Prescription status shown
- ✅ Fraud detection works
- ✅ Scan count tracked

---

## 🎯 Final Verification Checklist

Before considering testing complete, verify:

- [ ] All 10 tests passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Database schema matches code
- [ ] All features work as designed
- [ ] UI matches reference screenshots
- [ ] Reports generate correctly
- [ ] Export functionality works
- [ ] Mobile responsive
- [ ] Error handling robust

---

## 🐛 Common Issues & Solutions

### Issue: "No prescription found"
**Solution:** Make sure prescription status is "forwarded" before searching in Medicine

### Issue: Reports show zero
**Solution:** Check time period filter - may need to select "Weekly" or "Monthly"

### Issue: Database connection error
**Solution:** Verify `.env` has correct Supabase credentials

### Issue: TypeScript errors
**Solution:** Run `npm run type-check` to see specific errors

### Issue: UI not updating
**Solution:** Check browser console, may need to refresh or clear cache

---

## 📊 Expected Test Results Summary

After completing all tests, you should have:

- **Patients**: Multiple records across all departments
- **Prescriptions**: All with status "dispensed"
- **Receipts**: All active, some with scan_count > 0
- **Reports**: Accurate statistics displayed
- **Export**: JSON files generated successfully

All features working as shown in reference screenshots! ✅
