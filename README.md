# SS Cleaners - Professional Cleaning Services Platform

A modern, full-stack web application for SS Cleaners - a professional cleaning services business.

## 🚀 Features

### Customer Portal
- Service browsing and booking
- Real-time chat with admin
- Booking management and history
- Secure payment integration (Razorpay)
- User authentication

### Admin Dashboard
- Enquiry and lead management
- Booking management with status updates
- Real-time chat with customers
- Payment tracking
- Revenue analytics and statistics

### Payment Integration
- Razorpay payment gateway
- Test and live mode support
- Multiple payment methods (UPI, Cards, Net Banking, Wallets)
- Payment verification and order tracking

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Payment**: Razorpay
- **Hosting**: Vercel
- **Real-time**: Supabase Realtime (WebSocket)

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### 1. Supabase Setup
- Create project at [supabase.com](https://supabase.com)
- Run all migrations from `supabase/migrations/`
- Deploy Edge Functions from `supabase/functions/`

### 2. Razorpay Setup
See `RAZORPAY_SETUP.md` for detailed payment integration instructions.

### 3. Environment Variables
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   ├── chat/           # Real-time chat widgets
│   ├── home/           # Homepage sections
│   └── ui/             # shadcn/ui components
├── pages/
│   ├── admin/          # Admin portal pages
│   ├── booking/        # Booking flow pages
│   ├── payment/        # Payment checkout pages
│   └── services/       # Service detail pages
├── hooks/              # Custom React hooks
└── integrations/       # Supabase client

supabase/
├── functions/          # Edge Functions (Deno)
└── migrations/         # Database migrations
```

## 🗄️ Database Schema

Main tables:
- `enquiries` - Customer service enquiries
- `bookings` - Service bookings with details
- `conversations` - Chat conversations
- `messages` - Chat messages with read receipts
- `payment_orders` - Razorpay payment tracking

## 🚀 Deployment

**Supabase Edge Functions:**
```bash
npx supabase functions deploy create-razorpay-order --project-ref YOUR_PROJECT_ID
npx supabase functions deploy verify-razorpay-payment --project-ref YOUR_PROJECT_ID
```

**Frontend (Vercel):**
- Connect GitHub repository to Vercel
- Add environment variables
- Deploy automatically on push

## 📝 License

© 2025 SS Cleaners. All rights reserved.

## 🤝 Support

For support, contact: support@sscleaners.in
