# HealthChain Supabase Setup - Quick Checklist

## ✅ Completed
- [x] Environment variables configured (.env file created)
- [x] Supabase client ready (src/lib/supabase.ts)
- [x] .gitignore updated to protect credentials

## 🚀 Your Next Steps

### 1️⃣ Set Up Database (5 minutes)
- [ ] Go to https://supabase.com/dashboard/project/wghfwmaamkiurpdxlrhf
- [ ] Click "SQL Editor" → "New Query"
- [ ] Copy all content from `scripts/create-healthchain-tables.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify tables created in "Table Editor"

### 2️⃣ Install Dependencies (2 minutes)
```bash
cd HealthChain-main
npm install
```

### 3️⃣ Start Development Server (1 minute)
```bash
npm run dev
```

### 4️⃣ Test the App
- [ ] Open http://localhost:5173
- [ ] Register a test patient
- [ ] Check Supabase dashboard to see the data

## 🎉 That's It!

Total setup time: ~10 minutes

See `SUPABASE_SETUP.md` for detailed documentation.
