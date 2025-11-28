# SS PureCare - Professional Cleaning Services

A modern booking and management platform for professional cleaning services with real-time customer communication.

## 🌟 Features

### Customer Portal
- **User Authentication** - Email/password + Google OAuth signup/login with email verification
- **Service Booking** - Easy online booking for house cleaning, office cleaning, and water tank services
- **My Bookings** - View all bookings with detailed information and status tracking
- **Real-time Chat** - Communicate directly with support team through chat widget
- **Profile Management** - Editable user profiles with contact information
- **Password Recovery** - Forgot password and reset functionality

### Admin Portal
- **Dashboard** - Overview of leads, enquiries, and bookings
- **Lead Management** - Track and manage customer leads from chatbot
- **Enquiry Management** - Handle customer service enquiries with real-time chat
- **Booking Management** - Create and manage service bookings
- **Service Management** - Configure services and pricing dynamically
- **Gallery Management** - Upload and manage service portfolio images

### Technical Features
- **Real-time Updates** - Supabase real-time subscriptions for chat and notifications
- **Email Notifications** - Automated emails for enquiries, bookings, and chat messages
- **Row-Level Security** - Secure data access with Supabase RLS policies
- **Image Optimization** - Automatic image compression for gallery uploads
- **Responsive Design** - Mobile-first design with Tailwind CSS

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **Deployment**: Lovable.dev

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Environment Setup

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentation

- **AUTHENTICATION_SETUP.md** - Complete guide for setting up authentication
- **NEXT_STEPS.md** - Post-installation setup and testing guide

## 🗄️ Database Schema

The project uses Supabase with the following main tables:
- `leads` - Customer leads from chatbot
- `enquiries` - Service enquiry requests
- `bookings` - Service bookings with pricing
- `conversations` - Chat conversations
- `messages` - Chat messages
- `services` - Service catalog
- `pricing_matrix` - Dynamic pricing configuration
- `gallery_images` - Service portfolio images
- `user_roles` - Admin role management

## 🔐 Authentication

The app supports:
- Email/Password authentication with email verification
- Google OAuth (configured for external users)
- Protected routes requiring authentication
- Row-level security for data access

## 🎨 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin portal components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat widget components
│   ├── home/           # Homepage sections
│   ├── layout/         # Navigation and footer
│   └── ui/             # shadcn/ui components
├── pages/
│   ├── admin/          # Admin dashboard pages
│   ├── booking/        # Booking pages
│   ├── payment/        # Payment pages
│   ├── services/       # Service detail pages
│   └── *.tsx           # Public pages
├── hooks/              # Custom React hooks
├── integrations/       # Supabase client setup
└── lib/                # Utility functions

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

## 🚀 Deployment

The project is deployed on Lovable.dev. To deploy:

1. Push changes to the main branch
2. Visit your Lovable project dashboard
3. Click Share → Publish

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

All rights reserved © SS PureCare
