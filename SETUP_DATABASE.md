# Database Setup Instructions

## ⚠️ IMPORTANT: Apply Migration First

The booking system requires database tables that don't exist yet. Follow these steps:

## Step 1: Apply the Migration

### Option A: Via Supabase Dashboard (Easiest)

1. **Go to your Supabase project**: https://app.supabase.com
2. **Navigate to SQL Editor** (left sidebar)
3. **Open this file**: `supabase/migrations/20251128100000_two_step_booking_system.sql`
4. **Copy all the SQL content**
5. **Paste into SQL Editor**
6. **Click "Run"** (or press Ctrl+Enter)

### Option B: Via Supabase CLI

If you have Supabase CLI installed:

```powershell
# Install CLI globally if needed
npm install -g supabase

# Link your project (first time only)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Step 2: Set Up Edge Functions

The system uses 3 Edge Functions for email notifications:

1. **send-enquiry-notification** - Sends confirmation when enquiry is submitted
2. **send-booking-link** - Sends magic link email
3. **send-booking-confirmation** - Sends confirmation when booking is complete
4. **send-chat-notification** - Sends notification for chat messages

### Deploy Edge Functions:

```powershell
# Deploy all functions
supabase functions deploy send-enquiry-notification
supabase functions deploy send-booking-link
supabase functions deploy send-booking-confirmation
supabase functions deploy send-chat-notification
```

### Set Environment Variables:

In your Supabase project dashboard:
1. Go to **Settings** > **Edge Functions**
2. Add these secrets:
   - `RESEND_API_KEY` - Your Resend API key
   - `APP_URL` - Your frontend URL (e.g., http://localhost:5173 or https://yourdomain.com)

## Step 3: Update Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Step 4: Verify Setup

After applying the migration, verify these tables exist:

✅ `enquiries` - Customer enquiry submissions
✅ `enquiry_tokens` - Magic link tokens
✅ `bookings` - Completed booking details
✅ `conversations` - Chat conversations
✅ `messages` - Chat messages
✅ `email_notifications` - Email tracking

## What Was Created?

### Tables:
- **enquiries** - Simple contact form submissions (step 1)
- **enquiry_tokens** - Secure tokens for booking links
- **bookings** - Full booking details (step 2)
- **conversations** - 1-to-1 chat system
- **messages** - Chat messages
- **email_notifications** - Email tracking

### Functions:
- `generate_booking_token()` - Creates secure random tokens
- `create_conversation_for_enquiry()` - Auto-creates chat
- `update_unread_counts()` - Tracks unread messages
- `mark_messages_read()` - Marks messages as read

### Triggers:
- Auto-create conversation when enquiry submitted
- Auto-update unread counts on new messages
- Auto-update `updated_at` timestamps

## Troubleshooting

### Error: "Failed to load resource: 404"
- **Cause**: Migration not applied yet
- **Fix**: Follow Step 1 above

### Error: "relation 'enquiries' does not exist"
- **Cause**: Migration not applied
- **Fix**: Run the SQL in Supabase Dashboard

### Error: "permission denied"
- **Cause**: RLS policies need authentication
- **Fix**: Migration includes RLS policies, but check admin role exists

## Admin Role Setup

To access admin pages, you need an admin role. Run this in SQL Editor:

```sql
-- Create has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add your role checking logic here
  -- For now, you can hardcode admin user IDs or use a roles table
  RETURN true; -- Temporary: allows all authenticated users
END;
$$;
```

Then update with proper role checking based on your auth setup.

## Test the System

1. **Test Contact Form**: Go to `/contact` and submit an enquiry
2. **Check Admin Dashboard**: Go to `/admin/enquiries` to see enquiries
3. **Send Magic Link**: Click on enquiry, send booking link
4. **Complete Booking**: Use the magic link to fill booking form
5. **View Bookings**: Go to `/admin/bookings` to see completed bookings

## Questions?

Check the main README.md for system architecture and feature details.
