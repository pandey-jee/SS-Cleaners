# 🧹 Project Cleanup - Files to Delete/Keep

## ❌ DELETE - Duplicate/Redundant SQL Files

These are temporary fix attempts - you only need `FULL_DATABASE_SETUP.sql`:

```
supabase/fix_enquiry_rls.sql
supabase/fix_enquiry_rls_complete.sql  
supabase/ultimate_rls_fix.sql
```

**Action**: Delete these 3 files ✅

---

## ✅ KEEP - Essential Database Files

**Main Setup File (Run this ONCE):**
- `supabase/FULL_DATABASE_SETUP.sql` - Complete database schema (all tables, functions, policies)

**RLS Fix (Run this to fix permissions):**
- `supabase/FINAL_RLS_FIX.sql` - Fixes Row Level Security policies

**Old Migrations (Already included in FULL_DATABASE_SETUP.sql):**
- `supabase/migrations/20251118071905_*.sql` - Chat + Leads tables
- `supabase/migrations/20251118071939_*.sql` - Function fix
- `supabase/migrations/20251119064232_*.sql` - User roles + Services
- `supabase/migrations/20251121060222_*.sql` - Gallery + Storage
- `supabase/migrations/20251122010614_*.sql` - Gallery enhancement
- `supabase/migrations/20251128100000_*.sql` - Two-step booking system

**Note**: These migrations are for reference only. Everything is consolidated in `FULL_DATABASE_SETUP.sql`

---

## ✅ KEEP - Edge Functions (Need to Deploy)

**Active Functions (Used in your app):**
- `supabase/functions/send-enquiry-notification/` - ✅ Keep
- `supabase/functions/send-booking-link/` - ✅ Keep
- `supabase/functions/send-booking-confirmation/` - ✅ Keep
- `supabase/functions/send-chat-notification/` - ✅ Keep

**Unused/Legacy Functions (Delete if not needed):**
- `supabase/functions/chat-ai/` - ❓ AI chatbot (optional feature)
- `supabase/functions/create-checkout/` - ❌ DELETE (payment not implemented)
- `supabase/functions/initiate-booking/` - ❌ DELETE (old system, replaced by two-step)
- `supabase/functions/send-notification/` - ❌ DELETE (generic, replaced by specific ones)

---

## ✅ KEEP - Documentation Files

**Main Guides:**
- `README.md` - Project overview
- `ADMIN_PORTAL_COMPLETE.md` - Complete admin portal guide ✅
- `SETUP_DATABASE.md` - Database setup instructions ✅

**Old/Redundant Docs:**
- `IMPLEMENTATION_SUMMARY.md` - ❓ Check if still relevant

---

## 📁 Final Clean Structure

```
SSCleanerTEST/
├── .env                          ✅ Keep (your credentials)
├── .gitignore                    ✅ Keep
├── package.json                  ✅ Keep
├── vite.config.ts               ✅ Keep
├── tailwind.config.ts           ✅ Keep
├── tsconfig.json                ✅ Keep
├── README.md                     ✅ Keep
├── ADMIN_PORTAL_COMPLETE.md     ✅ Keep (main guide)
├── SETUP_DATABASE.md            ✅ Keep (setup guide)
├── public/                       ✅ Keep
├── src/                          ✅ Keep (all your code)
└── supabase/
    ├── config.toml              ✅ Keep
    ├── FULL_DATABASE_SETUP.sql  ✅ Keep (run once in SQL editor)
    ├── FINAL_RLS_FIX.sql        ✅ Keep (run to fix permissions)
    ├── migrations/              ✅ Keep (reference only)
    └── functions/
        ├── send-enquiry-notification/      ✅ Keep & Deploy
        ├── send-booking-link/              ✅ Keep & Deploy
        ├── send-booking-confirmation/      ✅ Keep & Deploy
        ├── send-chat-notification/         ✅ Keep & Deploy
        ├── chat-ai/                        ❓ Optional (AI chatbot)
        ├── create-checkout/                ❌ DELETE
        ├── initiate-booking/               ❌ DELETE
        └── send-notification/              ❌ DELETE
```

---

## 🎯 Cleanup Commands

Run these in PowerShell from project root:

```powershell
# Delete duplicate SQL fix files
Remove-Item "supabase\fix_enquiry_rls.sql"
Remove-Item "supabase\fix_enquiry_rls_complete.sql"
Remove-Item "supabase\ultimate_rls_fix.sql"

# Delete unused edge functions
Remove-Item "supabase\functions\create-checkout" -Recurse
Remove-Item "supabase\functions\initiate-booking" -Recurse
Remove-Item "supabase\functions\send-notification" -Recurse

# Optional: Delete AI chatbot if not using
# Remove-Item "supabase\functions\chat-ai" -Recurse

# Optional: Delete old implementation summary
# Remove-Item "IMPLEMENTATION_SUMMARY.md"
```

---

## ✅ After Cleanup - What to Run in Supabase

**Step 1: Setup Database (First Time)**
```sql
-- In Supabase Dashboard → SQL Editor
-- Run: supabase/FULL_DATABASE_SETUP.sql
```

**Step 2: Fix Permissions (After setup)**
```sql
-- In Supabase Dashboard → SQL Editor  
-- Run: supabase/FINAL_RLS_FIX.sql
```

**Step 3: Deploy Edge Functions**
```bash
supabase functions deploy send-enquiry-notification
supabase functions deploy send-booking-link
supabase functions deploy send-booking-confirmation
supabase functions deploy send-chat-notification
```

Done! 🎉
