# Quick Deploy Guide

## The CORS errors mean your Edge Functions aren't deployed yet!

### Step 1: Get Resend API Key (2 minutes)
1. Go to https://resend.com
2. Sign up (free - 100 emails/day, 3,000/month)
3. Verify your email
4. Go to API Keys → Create API Key
5. Copy the key (starts with `re_`)

### Step 2: Install Supabase CLI (1 minute)
```powershell
npm install -g supabase
```

### Step 3: Login to Supabase
```powershell
supabase login
```
This will open your browser for authentication.

### Step 4: Run the Deployment Script
```powershell
.\deploy-functions.ps1
```

**OR deploy manually:**

```powershell
# Link your project (get project ref from URL: supabase.com/dashboard/project/YOUR_REF)
supabase link --project-ref xqnqkzzqlkrhwuofbvhf

# Set secrets
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set ADMIN_EMAIL=your_email@example.com
supabase secrets set APP_URL=http://localhost:8080

# Deploy all functions
supabase functions deploy send-enquiry-notification --no-verify-jwt
supabase functions deploy send-booking-link --no-verify-jwt
supabase functions deploy send-booking-confirmation --no-verify-jwt
supabase functions deploy send-chat-notification --no-verify-jwt
```

### Step 5: Test!
1. Submit enquiry at http://localhost:8080/contact
2. Check admin gets email notification
3. Login to admin panel
4. Send booking link from enquiry detail
5. Check customer receives email with magic link

## What Each Function Does

| Function | Trigger | Email To | Purpose |
|----------|---------|----------|---------|
| `send-enquiry-notification` | Contact form submit | Admin | New enquiry alert |
| `send-booking-link` | Admin clicks "Send Link" | Customer | Magic link to complete booking |
| `send-booking-confirmation` | Booking completed | Customer | Booking confirmation |
| `send-chat-notification` | Message sent | Customer/Admin | New chat message alert |

## Verify Deployment

```powershell
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs send-booking-link
supabase functions logs send-chat-notification
```

## Troubleshooting

### "Command not found: supabase"
- Supabase CLI not installed
- Run: `npm install -g supabase`

### "Failed to link project"
- Not logged in
- Run: `supabase login`

### "Invalid API key"
- Wrong Resend API key
- Get new one from https://resend.com/api-keys
- Run: `supabase secrets set RESEND_API_KEY=re_your_new_key`

### CORS errors still happening
- Functions not deployed yet
- Run deployment script again
- Wait 1-2 minutes for deployment to propagate

### Emails not sending
- Check Resend dashboard for delivery logs
- Verify sender domain if using custom domain
- Check function logs: `supabase functions logs FUNCTION_NAME`

## Free Tier Limits

**Resend:**
- 100 emails/day
- 3,000 emails/month
- Perfect for testing and small projects!

**Supabase Edge Functions:**
- 500,000 invocations/month
- More than enough for most apps!

---

**After deployment, the CORS errors will disappear and emails will be sent! 🚀**
