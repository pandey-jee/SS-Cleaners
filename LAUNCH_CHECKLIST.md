# 🚀 Production Launch Checklist

Print this or keep it open while deploying!

---

## ✅ PRE-LAUNCH CHECKLIST

### Database & Security
- [ ] Security migration deployed (`supabase db push`)
- [ ] Admin user created in `user_roles` table
- [ ] RLS policies tested (non-admins can't access admin data)
- [ ] Enquiry tokens can't be enumerated
- [ ] Conversations restricted to admins only

### Code & Repository
- [ ] All security fixes committed ✅ (Done: commit 75c281d)
- [ ] Console.log statements cleaned ✅
- [ ] Password strength updated ✅
- [ ] Security headers configured ✅
- [ ] No sensitive data in repository ✅

### Frontend Deployment (Vercel)
- [ ] Connected GitHub repository to Vercel
- [ ] Environment variables added:
  - [ ] `VITE_SUPABASE_PROJECT_ID`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
  - [ ] `VITE_SUPABASE_URL`
- [ ] Build successful
- [ ] Deployment URL noted: ___________________________
- [ ] Custom domain configured (optional)
- [ ] HTTPS working

### Backend (Supabase Edge Functions)
- [ ] All Edge Functions deployed
- [ ] Environment variables set:
  - [ ] `ENVIRONMENT=production`
  - [ ] `APP_URL` (your production URL)
  - [ ] `RAZORPAY_KEY_ID` (LIVE key)
  - [ ] `RAZORPAY_KEY_SECRET` (LIVE key)
  - [ ] `GMAIL_USER`
  - [ ] `GMAIL_APP_PASSWORD`
- [ ] CORS updated with production domain
- [ ] Functions redeployed after CORS update

### Payment Integration
- [ ] Razorpay account in LIVE mode
- [ ] LIVE API keys obtained
- [ ] Test payment completed successfully
- [ ] Payment status updates working
- [ ] Receipt generation working
- [ ] Confirmation email sent

### Testing
- [ ] Can submit enquiry (not logged in)
- [ ] Enquiry notification emails sent
- [ ] Admin can login
- [ ] Admin dashboard accessible
- [ ] Admin can send booking link
- [ ] Booking link email received
- [ ] Can complete booking via token
- [ ] Payment completes successfully
- [ ] Booking status updates to "confirmed"
- [ ] Payment status shows "paid"
- [ ] Confirmation email sent after payment

### Security Verification
- [ ] `/admin` requires authentication
- [ ] Non-admin users redirected from admin routes
- [ ] Security headers present (check DevTools Network tab)
- [ ] HTTPS enforced (no mixed content warnings)
- [ ] CORS working (no CORS errors in console)
- [ ] Strong passwords enforced (8+ chars, complexity)

---

## 📱 QUICK TEST SCRIPT

### Test 1: Public Enquiry Flow (5 min)
1. Open homepage (not logged in)
2. Navigate to Contact/Services page
3. Submit enquiry with real email
4. Check email for confirmation ✅

### Test 2: Admin Flow (10 min)
1. Login as admin
2. Go to admin dashboard
3. Find your test enquiry
4. Send booking link
5. Check email for booking link ✅

### Test 3: Booking & Payment (10 min)
1. Click booking link from email
2. Fill out booking form completely
3. Submit booking
4. Click "Pay Now"
5. Complete payment with real card/UPI
6. Verify success message ✅
7. Check booking status = "confirmed" ✅
8. Check payment status = "paid" ✅
9. Check confirmation email received ✅

### Test 4: Security (5 min)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Click on any request
5. Check Response Headers for:
   - `X-Frame-Options: DENY` ✅
   - `X-Content-Type-Options: nosniff` ✅
   - `Content-Security-Policy: ...` ✅
6. Try accessing `/admin` without login → Redirected ✅
7. Open Console tab → No CORS errors ✅

---

## 🆘 IF SOMETHING GOES WRONG

### Payment Failing?
→ Check `DEPLOYMENT_GUIDE.md` - "Issue: Payment Failing"

### Admin Can't Access Dashboard?
→ Check `DEPLOYMENT_GUIDE.md` - "Issue: Admin Dashboard Not Accessible"

### Emails Not Sending?
→ Check `DEPLOYMENT_GUIDE.md` - "Issue: Emails Not Sending"

### CORS Errors?
→ Check `DEPLOYMENT_GUIDE.md` - "Issue: CORS Errors"

### Database Errors?
→ Check Supabase logs, verify migration ran successfully

---

## 📞 DOCUMENTATION REFERENCE

- **Full Security Audit:** `SECURITY_AUDIT.md`
- **Deployment Steps:** `DEPLOYMENT_GUIDE.md`
- **Security Summary:** `SECURITY_FIXES_SUMMARY.md`
- **Edge Functions:** `supabase/functions/SECURITY_README.md`

---

## ✨ LAUNCH DAY!

When all checkboxes are complete:

1. Take a deep breath 😌
2. Make announcement post/tweet
3. Monitor for first 2-4 hours
4. Check Supabase logs periodically
5. Respond to any enquiries promptly
6. Celebrate! 🎉

---

**Launch Date:** _______________  
**Launch Time:** _______________  
**First Enquiry Received:** _______________  
**First Payment Received:** _______________

**Notes:**
_________________________________
_________________________________
_________________________________

---

## 🎯 POST-LAUNCH (First 48 Hours)

- [ ] Check Supabase logs every 4 hours
- [ ] Monitor payment success rate
- [ ] Check email delivery rate
- [ ] Verify no security errors
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Respond to test enquiries

## 📊 POST-LAUNCH (First Week)

- [ ] Daily log review
- [ ] Customer feedback collected
- [ ] Performance monitoring
- [ ] Any bug fixes deployed
- [ ] Analytics setup (optional)

---

**All checkboxes complete?**  
**Congratulations! Your app is LIVE! 🚀🎉**
