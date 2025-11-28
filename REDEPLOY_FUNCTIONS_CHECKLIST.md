# 🚀 Edge Functions Redeployment Checklist

## ⚠️ CRITICAL: All 4 functions need to be redeployed with updated code

The deployed versions in Supabase have **OLD column names** that don't match your database schema.

---

## 📋 Redeploy These 4 Functions

Go to: **https://supabase.com/dashboard/project/zvnkbxvvyqmxcygghdii/functions**

### ✅ 1. send-enquiry-notification
- **Local File**: `supabase\functions\send-enquiry-notification\index.ts`
- **Status**: ✅ Fixed locally (correct column names)
- **Action**: Copy entire file content → Paste in Supabase Dashboard Editor → Deploy

### ✅ 2. send-booking-link  
- **Local File**: `supabase\functions\send-booking-link\index.ts`
- **Status**: ✅ Fixed locally (correct column names)
- **Action**: Copy entire file content → Paste in Supabase Dashboard Editor → Deploy

### ✅ 3. send-booking-confirmation
- **Local File**: `supabase\functions\send-booking-confirmation\index.ts` 
- **Status**: ✅ Fixed locally (correct column names)
- **Action**: Copy entire file content → Paste in Supabase Dashboard Editor → Deploy

### ✅ 4. send-chat-notification
- **Local File**: `supabase\functions\send-chat-notification\index.ts`
- **Status**: ✅ Fixed locally (correct column names)  
- **Action**: Copy entire file content → Paste in Supabase Dashboard Editor → Deploy

---

## 🔧 Deployment Steps (For Each Function)

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/zvnkbxvvyqmxcygghdii/functions
2. Click on function name (e.g., "send-enquiry-notification")
3. Click **"Edit function"** button
4. Open the local file in VS Code
5. **Select All** (Ctrl+A) and **Copy** (Ctrl+C)
6. Go back to Supabase Dashboard
7. **Delete all code** in the editor
8. **Paste** the copied code (Ctrl+V)
9. Click **"Deploy"** button
10. Wait for deployment to complete (green checkmark)
11. Repeat for next function

---

## 🧪 After Redeployment - Test These Scenarios

### Test 1: Contact Form Submission
1. Go to `/contact` page
2. Fill out the form
3. Submit enquiry
4. ✅ Check: Customer receives confirmation email
5. ✅ Check: Admin receives notification email
6. ✅ Check: No 500 errors in browser console

### Test 2: Admin Chat Message
1. Login to admin panel
2. Go to Enquiries → Click an enquiry
3. Type a message in chat
4. Click "Send Message"
5. ✅ Check: Message appears instantly (no reload needed)
6. ✅ Check: Customer receives email notification
7. ✅ Check: No 500 errors in browser console

### Test 3: Send Booking Link
1. In admin enquiry detail page
2. Click "Send Booking Link" button
3. ✅ Check: Customer receives magic link email
4. ✅ Check: Link appears in chat (if checkbox was selected)
5. ✅ Check: Admin receives confirmation email
6. ✅ Check: No 500 errors

### Test 4: Complete Booking
1. Customer opens magic link
2. Fills out booking form
3. Submits booking
4. ✅ Check: Customer receives booking confirmation email
5. ✅ Check: Admin receives new booking notification
6. ✅ Check: No 500 errors

---

## ✅ What Was Fixed

### Database Schema (email_notifications table):
```sql
- notification_type TEXT NOT NULL  -- e.g., 'enquiry_received', 'booking_confirmed'
- recipient_type TEXT NOT NULL     -- 'admin' or 'user'
- subject TEXT NOT NULL            -- Email subject
- body TEXT NOT NULL               -- Description of notification
```

### Old Code (WRONG - causes 500 errors):
```typescript
await supabaseClient.from("email_notifications").insert({
  email_type: "enquiry_confirmation",  // ❌ WRONG column name
  subject: "...",
  status: "sent",
});
```

### New Code (CORRECT):
```typescript
await supabaseClient.from("email_notifications").insert({
  recipient_type: "user",                      // ✅ Required
  notification_type: "enquiry_received",       // ✅ Required
  subject: "We've Received Your Enquiry",      // ✅ Required
  body: "Enquiry confirmation sent",           // ✅ Required
  status: "sent",
});
```

---

## 🎯 Real-Time Chat Fix

### What Was Fixed in AdminEnquiryDetail.tsx:
1. **Real-time subscription** now waits for conversation to load before subscribing
2. **Messages appear instantly** without page reload
3. **Email notifications** sent asynchronously (don't block UI)
4. Added **console logs** for debugging

### Changes Made:
- Split useEffect hooks (separate for conversation loading and subscription)
- Fixed filter to use conversation.id properly
- Added auto-refresh after sending message
- Made email notification non-blocking

---

## 📊 Expected Results After Redeployment

### Before (Current State):
- ❌ 500 errors on every function call
- ❌ No emails sent to anyone
- ❌ Chat messages only appear after reload
- ❌ Database inserts failing

### After (Fixed State):
- ✅ No 500 errors
- ✅ Emails sent to admin AND customer
- ✅ Chat messages appear in real-time
- ✅ All notifications logged in database
- ✅ Complete two-step booking flow works end-to-end

---

## 🆘 If Issues Persist After Redeployment

1. **Check Supabase Function Logs**:
   - Dashboard → Functions → Click function name → "Logs" tab
   - Look for error messages

2. **Check Browser Console**:
   - F12 → Console tab
   - Look for 500 errors or network errors

3. **Check Database**:
   - Dashboard → Table Editor → email_notifications
   - Verify new rows are being inserted

4. **Verify Secrets**:
   - Dashboard → Functions → Settings
   - Confirm: RESEND_API_KEY, ADMIN_EMAIL, APP_URL are set

---

## ⏱️ Estimated Time

- **Redeployment**: 10-15 minutes (all 4 functions)
- **Testing**: 10-15 minutes (all scenarios)
- **Total**: ~25-30 minutes

---

## 🎉 Success Criteria

When everything is working:
1. ✅ Contact form submits successfully
2. ✅ Both admin and customer receive emails
3. ✅ Chat messages appear instantly without reload
4. ✅ Booking links sent via email
5. ✅ Complete bookings trigger confirmation emails
6. ✅ No 500 errors anywhere
7. ✅ email_notifications table has new rows

---

**START HERE**: Open Supabase Dashboard and begin with function #1! 🚀
