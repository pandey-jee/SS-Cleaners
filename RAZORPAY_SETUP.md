# Razorpay Payment Integration Setup

## 🎉 Complete Integration Installed!

Your SS PureCare platform now has **full Razorpay payment integration** with UPI, cards, net banking, and wallets support.

---

## 📋 Setup Steps

### 1. Get Razorpay Credentials

1. Login to your Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Generate Keys (if not already done)
4. Copy:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (keep this secret!)

### 2. Add Credentials to Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add these environment variables:

```bash
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Important:** Use `rzp_test_` keys for testing, `rzp_live_` for production.

### 3. Deploy Supabase Functions

Run these commands in your terminal:

```powershell
# Navigate to project
cd C:\Development\SSCleanerTEST

# Deploy create order function
supabase functions deploy create-razorpay-order

# Deploy verify payment function
supabase functions deploy verify-razorpay-payment
```

### 4. Run Database Migration

```powershell
# Apply the payment_orders table migration
supabase db push
```

Or manually run the migration in Supabase SQL Editor:
- File: `supabase/migrations/20251202014130_payment_orders_table.sql`

---

## 🚀 How It Works

### Payment Flow

```
Customer submits booking
         ↓
Admin sends booking link via email
         ↓
Customer clicks "Pay Now" button
         ↓
Redirects to: /payment/checkout?bookingId=xxx&amount=2500
         ↓
Razorpay payment modal opens (UPI/Cards/etc)
         ↓
Customer completes payment
         ↓
Payment verified on backend
         ↓
Booking status → "confirmed"
         ↓
Confirmation email sent
         ↓
Redirects to: /payment/success
```

### Files Created

**Edge Functions:**
- `supabase/functions/create-razorpay-order/index.ts` - Creates payment order
- `supabase/functions/verify-razorpay-payment/index.ts` - Verifies payment signature

**Frontend:**
- `src/pages/payment/RazorpayCheckout.tsx` - Payment page with Razorpay modal
- `src/pages/payment/Success.tsx` - Updated success page

**Database:**
- `payment_orders` table - Tracks all payment transactions
- `payment_status` column added to bookings

---

## 🧪 Testing

### Test Mode (FREE)

1. Use test credentials: `rzp_test_...`
2. Use Razorpay test cards:
   - **Success:** 4111 1111 1111 1111
   - **Failure:** 4000 0000 0000 0002
   - CVV: Any 3 digits
   - Expiry: Any future date

3. Test UPI: `success@razorpay`

### Test Flow

```powershell
# 1. Create a test booking in admin panel
# 2. Get the booking link
# 3. Click "Pay Now"
# 4. Use test card: 4111 1111 1111 1111
# 5. Complete payment
# 6. Check booking status changes to "confirmed"
```

---

## 💰 Pricing

**Razorpay Fees:**
- Domestic cards: 2% per transaction
- International cards: 3% + ₹2
- UPI: FREE (up to 50,000/month)
- Net Banking: 2%
- Wallets: 2%

**No setup fees, no annual fees!** Pay only for successful transactions.

---

## 🔧 Configuration

### Change Currency

In `create-razorpay-order/index.ts`:
```typescript
currency: 'INR' // Change to USD, EUR, etc.
```

### Customize Payment Modal

In `RazorpayCheckout.tsx`:
```typescript
const options = {
  theme: {
    color: '#0EA5E9', // Your brand color
  },
  name: 'SS PureCare', // Your company name
  // ... more options
};
```

---

## 🛡️ Security Features

✅ **Payment signature verification** - Backend validates all payments
✅ **HTTPS only** - Secure transmission
✅ **PCI DSS compliant** - Razorpay handles card data
✅ **Row Level Security** - Database access controlled
✅ **Service role only** - Functions use secure keys

---

## 📊 Admin Features

### View Payments

```sql
-- In Supabase SQL Editor
SELECT 
  po.*,
  b.customer_name,
  b.customer_email,
  s.name as service_name
FROM payment_orders po
JOIN bookings b ON b.id = po.booking_id
JOIN services s ON s.id = b.service_id
ORDER BY po.created_at DESC;
```

### Check Failed Payments

```sql
SELECT * FROM payment_orders 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### Payment fails with "Invalid signature"

**Solution:** Check that `RAZORPAY_KEY_SECRET` is correct in Supabase.

### "Razorpay is not defined" error

**Solution:** Check internet connection - Razorpay script loads from CDN.

### Booking status not updating

**Solution:** Check Edge Function logs in Supabase Dashboard → Edge Functions.

### Payment successful but status stuck

**Solution:** Run verification function manually:
```sql
-- Update booking manually
UPDATE bookings 
SET status = 'confirmed', payment_status = 'paid'
WHERE id = 'your-booking-id';
```

---

## 🔄 Going Live

### Production Checklist

1. ✅ Replace test keys with live keys (`rzp_live_...`)
2. ✅ Enable webhook in Razorpay Dashboard
3. ✅ Test with real small amount (₹1)
4. ✅ Set up refund policy
5. ✅ Add terms and conditions
6. ✅ Enable payment notifications

### Webhook Setup (Optional)

1. Razorpay Dashboard → **Webhooks**
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/razorpay-webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Get webhook secret and add to Supabase secrets

---

## 📱 Payment Methods Supported

✅ **UPI** - Google Pay, PhonePe, Paytm, etc.
✅ **Credit/Debit Cards** - Visa, Mastercard, RuPay, Amex
✅ **Net Banking** - All major banks
✅ **Wallets** - Paytm, Mobikwik, Freecharge, etc.
✅ **EMI** - No-cost EMI options
✅ **International Cards** - For global customers

---

## 💡 Next Steps

1. **Test the payment flow** with test credentials
2. **Customize the checkout page** with your branding
3. **Set up refund policy** in Razorpay dashboard
4. **Go live** with production keys
5. **Monitor transactions** in Razorpay dashboard

---

## 📞 Support

**Razorpay Support:**
- Email: support@razorpay.com
- Phone: +91-80-46656600
- Docs: https://razorpay.com/docs/

**Integration Issues:**
Check Supabase Edge Function logs for detailed error messages.

---

## ✨ What's Integrated

✅ Complete payment flow
✅ Order creation
✅ Payment verification
✅ Signature validation
✅ Database tracking
✅ Email notifications
✅ Status updates
✅ Success/failure handling
✅ Responsive UI
✅ Mobile-friendly

**Your payment system is production-ready!** 🎉
