# Edge Functions Deployment Guide

## Prerequisites
1. ✅ Supabase CLI installed
2. ✅ Resend API account (get free API key from https://resend.com)
3. ✅ Edge functions code ready in `supabase/functions/`

## Available Edge Functions

### 1. `send-enquiry-notification`
- **Purpose**: Sends email to admin when new enquiry is submitted
- **Trigger**: Called from Contact form after successful submission
- **Email**: Notifies admin about new enquiry with details

### 2. `send-booking-link`
- **Purpose**: Sends magic link email to customer for booking
- **Trigger**: Admin clicks "Send Booking Link" in enquiry detail page
- **Email**: Contains secure token link to complete booking

### 3. `send-booking-confirmation`
- **Purpose**: Confirms booking completion to customer
- **Trigger**: After customer completes booking via magic link
- **Email**: Booking details, date, services, estimated price

### 4. `send-chat-notification`
- **Purpose**: Notifies about new chat messages
- **Trigger**: When messages are sent in conversation
- **Email**: Alerts admin/customer about new messages

## Deployment Steps

### Step 1: Login to Supabase CLI
```powershell
supabase login
```
This will open browser for authentication.

### Step 2: Link Your Project
```powershell
supabase link --project-ref YOUR_PROJECT_REF
```
Get your project ref from Supabase Dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### Step 3: Get Resend API Key
1. Go to https://resend.com
2. Sign up (free plan allows 100 emails/day)
3. Create API key in Dashboard
4. Copy the key (starts with `re_`)

### Step 4: Set Resend API Key as Secret
```powershell
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Step 5: Set Admin Email
```powershell
supabase secrets set ADMIN_EMAIL=your_admin_email@example.com
```

### Step 6: Deploy All Functions
```powershell
supabase functions deploy send-enquiry-notification
supabase functions deploy send-booking-link
supabase functions deploy send-booking-confirmation
supabase functions deploy send-chat-notification
```

Or deploy all at once:
```powershell
supabase functions deploy
```

### Step 7: Verify Deployment
```powershell
supabase functions list
```

## Testing Email Functions

### Test send-enquiry-notification
```powershell
supabase functions invoke send-enquiry-notification --data '{
  "enquiryId": "YOUR_ENQUIRY_ID",
  "notificationType": "enquiry_received"
}'
```

### Check Logs
```powershell
supabase functions logs send-enquiry-notification
```

## Environment Variables in Edge Functions

The functions automatically access:
- `RESEND_API_KEY` - Your Resend API key
- `ADMIN_EMAIL` - Admin notification email
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

## Email Templates

### Enquiry Notification (to Admin)
```
Subject: New Enquiry from [Customer Name]

Customer Details:
- Name: [name]
- Email: [email]
- Phone: [phone]
- City: [city]
- Service: [service_required]
- Message: [message]

View in Admin Panel:
https://yoursite.com/admin/enquiries/[id]
```

### Booking Link (to Customer)
```
Subject: Complete Your Booking - SS PureCare

Hi [Customer Name],

Thank you for your interest! Click the link below to complete your booking:

[Secure Magic Link]

This link expires in 7 days.
```

### Booking Confirmation (to Customer)
```
Subject: Booking Confirmed - SS PureCare

Hi [Customer Name],

Your booking has been confirmed!

Service: [service_type]
Date: [preferred_date]
Address: [full_address]
Estimated Price: ₹[estimated_price]

We'll contact you 24 hours before the appointment.
```

## Troubleshooting

### Function Returns 500 Error
- Check function logs: `supabase functions logs FUNCTION_NAME`
- Verify secrets are set: `supabase secrets list`
- Check Resend API key is valid

### Emails Not Sending
- Verify Resend API key is correct
- Check Resend dashboard for delivery status
- Ensure sender email is verified in Resend
- Check function logs for errors

### Authentication Errors
- Ensure functions have correct RLS policies
- Verify service role key is valid
- Check CORS settings if calling from browser

## Production Checklist

- [ ] Deploy all 4 edge functions
- [ ] Set RESEND_API_KEY secret
- [ ] Set ADMIN_EMAIL secret
- [ ] Verify sender domain in Resend
- [ ] Test enquiry submission end-to-end
- [ ] Test magic link generation and usage
- [ ] Test booking completion flow
- [ ] Check all emails are delivered
- [ ] Monitor function logs for errors
- [ ] Set up email sending limits (if needed)

## Cost Estimate

**Resend Pricing:**
- Free: 100 emails/day, 3,000/month
- Pro: $20/month - 50,000 emails/month
- Business: Custom pricing

**Supabase Edge Functions:**
- Free: 500,000 invocations/month
- Pro: 2,000,000 invocations/month included

For typical usage (10-50 enquiries/day), free tiers are sufficient!

## Next Steps After Deployment

1. Test complete user journey:
   - Submit enquiry via /contact
   - Check admin receives email
   - Login as admin, send magic link
   - Check customer receives link
   - Complete booking via link
   - Check confirmation email sent

2. Monitor function performance:
   - Check logs regularly
   - Monitor email delivery rates
   - Track failed invocations

3. Optimize as needed:
   - Add email templates styling
   - Implement retry logic for failed emails
   - Add email tracking (opens, clicks)
