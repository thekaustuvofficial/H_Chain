# HealthChain - Supabase Integration Guide

## ✅ Status: Configuration Complete

Your HealthChain project is now configured to connect to Supabase!

---

## 🔧 What's Been Set Up

1. **Environment Variables** - `.env` file created with your Supabase credentials
2. **Supabase Client** - Already configured in `src/lib/supabase.ts`
3. **Database Schema** - SQL file ready to deploy: `scripts/create-healthchain-tables.sql`

---

## 📋 Next Steps: Database Setup

### Step 1: Run the Database Schema

You need to create the database tables in your Supabase project:

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/wghfwmaamkiurpdxlrhf

2. **Open the SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Schema:**
   - Open the file `scripts/create-healthchain-tables.sql`
   - Copy ALL the SQL code
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Tables Were Created:**
   - Click on "Table Editor" in the left sidebar
   - You should see these tables:
     - `patients`
     - `prescriptions`
     - `receipts`
     - `token_counters`

---

## 🚀 Running Your Application

### Option 1: Using npm (Recommended)

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### Option 2: Using pnpm

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

### Option 3: Using bun

```bash
# Install dependencies
bun install

# Run the development server
bun dev
```

The app will be available at: `http://localhost:5173`

---

## 🗄️ Database Tables Overview

Your HealthChain system uses these tables:

### 1. **patients**
Stores patient registration and queue information
- Token numbers, personal info, symptoms
- Queue status, priority scoring
- References to prescriptions and receipts

### 2. **prescriptions**
Manages doctor prescriptions
- AI-generated and verified prescriptions
- Medicine details (dosage, frequency, duration)
- Prescription status tracking

### 3. **receipts**
Patient visit receipts
- Visit information and diagnosis
- Links to prescriptions
- QR code scan tracking

### 4. **token_counters**
Tracks token numbers by department
- Ensures unique token generation
- One counter per department

---

## 🔍 Testing the Connection

Once you run the app, test the integration:

1. **Patient Registration:**
   - Go to the registration page
   - Fill in patient details
   - Submit - this will create a record in the `patients` table

2. **Check Database:**
   - Go to Supabase Table Editor
   - View the `patients` table
   - You should see your test patient

3. **Test Other Features:**
   - Queue management (updates patient status)
   - Doctor dashboard (creates prescriptions)
   - Medicine dashboard (updates prescription status)

---

## 🛡️ Security Notes

### Current Setup (Development)
- Row Level Security (RLS) is enabled
- Policies allow full public access
- **This is OK for development/testing**

### For Production (Important!)
You should update the RLS policies to:
- Require authentication
- Restrict access based on user roles
- Add proper security rules

Example policy for authenticated users only:
```sql
DROP POLICY "Allow all access to patients" ON patients;
CREATE POLICY "Authenticated users only" ON patients
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

---

## 📁 Important Files

- **`.env`** - Your Supabase credentials (DO NOT commit to git!)
- **`src/lib/supabase.ts`** - Supabase client configuration
- **`scripts/create-healthchain-tables.sql`** - Database schema
- **`.gitignore`** - Should include `.env` to keep credentials private

---

## 🐛 Troubleshooting

### Connection Error: "Missing Supabase environment variables"
- Make sure `.env` file exists in the project root
- Restart the development server after creating `.env`

### Tables Not Found
- Run the SQL schema in Supabase SQL Editor
- Check that all tables were created successfully

### Data Not Saving
- Check Supabase logs in the dashboard
- Verify RLS policies are set correctly
- Check browser console for errors

### CORS Issues
- Supabase should allow localhost by default
- Check your Supabase project settings if issues persist

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎯 Quick Reference

**Your Supabase Project:**
- URL: https://wghfwmaamkiurpdxlrhf.supabase.co
- Dashboard: https://supabase.com/dashboard/project/wghfwmaamkiurpdxlrhf

**Local Development:**
- Run: `npm run dev`
- URL: http://localhost:5173

**Database Schema:**
- Location: `scripts/create-healthchain-tables.sql`
- Run in: Supabase SQL Editor

---

## ✨ You're All Set!

Your HealthChain project is ready to connect to Supabase. Just run the SQL schema and start your dev server!

Need help? Check the troubleshooting section above or review the Supabase documentation.
