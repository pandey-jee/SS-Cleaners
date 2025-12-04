# Edge Functions Security Notes

## CORS Configuration

⚠️ **IMPORTANT**: Before deploying to production, update CORS headers in all Edge Functions.

### Current Status
All Edge Functions currently use `Access-Control-Allow-Origin: *` which allows requests from ANY domain.

### What to Update

1. **After deploying your app**, update the CORS headers in each function:

```typescript
// Replace this:
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  ...
};

// With this:
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

2. **Or use the shared CORS helper**:

```typescript
import { getCorsHeaders } from "../_shared/cors.ts";

// In your handler:
const origin = req.headers.get("origin");
const corsHeaders = getCorsHeaders(origin);
```

### Files to Update

- ✅ `create-razorpay-order/index.ts`
- ✅ `verify-razorpay-payment/index.ts`
- ✅ `send-booking-link/index.ts`
- ✅ `send-enquiry-notification/index.ts`
- ✅ `send-booking-confirmation/index.ts`
- ✅ `send-chat-notification/index.ts`
- ✅ `chat-ai/index.ts`

### Steps

1. Deploy your app to Vercel/production
2. Get your production domain (e.g., `https://sscleaners.in`)
3. Update `supabase/functions/_shared/cors.ts` with your domain
4. Redeploy all Edge Functions:
   ```bash
   supabase functions deploy
   ```

## Environment Variables Required

Before production deployment, ensure these are set in Supabase:

- ✅ `RAZORPAY_KEY_ID` (live key, not test)
- ✅ `RAZORPAY_KEY_SECRET` (live key, not test)
- ✅ `GMAIL_USER`
- ✅ `GMAIL_APP_PASSWORD`
- ✅ `APP_URL` (your production URL)
- ✅ `ENVIRONMENT=production`

## Security Checklist

- [ ] Updated CORS to specific domain
- [ ] Replaced Razorpay test keys with live keys
- [ ] Verified all environment variables in Supabase
- [ ] Removed all console.log with sensitive data
- [ ] Tested payment flow end-to-end
- [ ] Created admin user in user_roles table
- [ ] Verified RLS policies working correctly
