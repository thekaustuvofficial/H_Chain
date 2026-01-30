# HealthQueue+ E-Prescription Flow - User Guide

## For Patients

### After Doctor Consultation

When your consultation is complete, you will receive a **Visit Receipt**. If the doctor prescribed medicines, your receipt will show:

1. **🎫 Prescription Token Number** - A large badge showing your token (e.g., `GM-001`)
2. **📋 Diagnosis** - What the doctor diagnosed
3. **💊 Medicine List** - All prescribed medicines with dosage
4. **✅ Status** - Shows "Ready for Collection" if forwarded to pharmacy

### To Collect Medicines

1. Go to the **Medicine Department**
2. Show your **Prescription Token** (the number in the green badge)
3. Medicine staff will enter your token
4. Collect your medicines
5. Your receipt will update to show "Dispensed"

### Important Notes

- Each prescription token can only be used **once** (fraud prevention)
- Keep your receipt until medicines are collected
- Download a copy of your receipt for records

---

## For Doctors

### Creating Prescriptions

1. **Call Next Patient** from your department queue
2. **Medical History Panel** appears on right sidebar
3. Enter **Main Diagnosis**
4. Click **Generate AI Prescription**
5. Review the AI-suggested medicines
6. Click **Verify Prescription**
7. Click **Forward to Medicine Dept & Complete**

### What Happens Next

- Prescription is forwarded with status "forwarded"
- Patient consultation is marked "completed"
- Receipt is generated with prescription details
- Patient moves to History tab
- Toast notification shows prescription token forwarded

### Completing Without Prescription

If no medicines needed:
- Click **Complete without Prescription**
- Patient gets basic receipt without prescription section

---

## For Medicine Department Staff

### Dispensing Medicines

1. Patient provides **Prescription Token** (e.g., `GM-001`)
2. Enter token in **Token Lookup** field
3. System displays:
   - Patient name
   - Diagnosis
   - List of medicines to dispense
4. Verify and prepare medicines
5. Click **Dispense Medicines**
6. Confirm dispensing
7. Status updates to "dispensed"

### E-Prescription Queue

The dashboard shows all prescriptions with status "forwarded":
- Click any prescription to auto-fill the token
- See forwarding time
- See number of medicines

### Fraud Prevention

- Each token can only be redeemed **once**
- System shows error if token already dispensed
- Prevents duplicate medicine collection

### Recently Dispensed

Shows last 6 dispensed prescriptions with:
- Token number
- Patient name  
- Dispensing time

---

## For Receptionists

### No Prescription Access

Receptionists can:
- ✅ View department queues
- ✅ Apply low escalation
- ✅ Mark late arrivals
- ✅ Transfer between departments

Receptionists **cannot**:
- ❌ Create prescriptions
- ❌ Dispense medicines
- ❌ Access prescription details

These functions are limited to Doctor and Medicine Department roles.

---

## Receipt Information Reference

### Receipt Sections

1. **Visit Information**
   - Patient name
   - Visit date and time
   - Doctor role
   - Visit type (routine/follow-up/referral)

2. **E-Prescription Section** (if applicable)
   - Prescription token (large, bold badge)
   - Diagnosis
   - List of medicines
   - Prescription status
   - Collection instructions

3. **QR Code**
   - Contains receipt verification data
   - Can be scanned to prevent fraud

4. **Receipt ID**
   - Unique identifier for the visit

### Receipt Statuses

- **Active** ✅ - Valid receipt, first scan
- **Already Fulfilled** ⚠️ - Receipt scanned multiple times (fraud alert)
- **Invalid** ❌ - Receipt has issues

### Prescription Statuses

- **Pending** - Created but not verified
- **Verified** ✓ - Doctor verified
- **Forwarded** → - Sent to Medicine Dept (Ready for collection)
- **Dispensed** ✓ - Medicines already collected

---

## Workflow Summary

```
PATIENT REGISTRATION
    ↓
WAITING IN QUEUE
    ↓
DOCTOR CALLS PATIENT
    ↓
CONSULTATION + DIAGNOSIS
    ↓
AI GENERATES PRESCRIPTION
    ↓
DOCTOR VERIFIES
    ↓
FORWARD TO MEDICINE DEPT
    ↓
RECEIPT GENERATED (with prescription token)
    ↓
PATIENT GOES TO MEDICINE DEPT
    ↓
SHOWS PRESCRIPTION TOKEN
    ↓
MEDICINE STAFF DISPENSES
    ↓
STATUS: DISPENSED ✓
```

---

## Troubleshooting

### "No prescription found for this token"
- Check token number is entered correctly
- Ensure doctor forwarded the prescription
- Token format: `XX-###` (e.g., `GM-001`)

### "Already dispensed"
- Medicines already collected for this token
- Each token can only be used once
- Contact doctor if there's an issue

### "Prescription not forwarded yet"
- Doctor may still be completing consultation
- Check with doctor
- Prescription must be "forwarded" status

### Receipt doesn't show prescription
- Doctor may have completed without prescription
- Check with doctor if medicines were prescribed
- Only prescriptions show in green section

---

## Demo Mode Notice

⚠️ **This is a demonstration system**
- AI prescriptions are simulated (keyword-based, not real medical AI)
- Medical history is simulated
- No real patient data is stored
- For demonstration and testing purposes only

---

## Support

For technical issues or questions:
1. Check this guide
2. Review the RECEIPT_MEDICINE_FLOW.md documentation
3. Contact system administrator
