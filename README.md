# Hair Hype Junior - Luxury Beauty Salon Website

A modern, full-featured website with an integrated admin dashboard for managing a luxury beauty salon business.

## Features

### Public Site
- **Responsive Design** - Optimized for all device sizes
- **Online Booking System** - Customer self-service reservation flow
- **Service Catalog** - Display of available services with pricing
- **Blog System** - Content management with markdown support
- **Reviews** - Customer testimonials and ratings
- **Gallery** - Showcase of work and salon ambiance

### Admin Dashboard
- **Calendar Management** - View and manage bookings by date
- **Booking Management** - Create, view, and manage customer appointments
- **Blog Editor** - Full markdown editor with live preview
- **Review Moderation** - View and delete customer reviews
- **Service Configuration** - Update pricing, duration, and availability
- **Settings** - Business information and configuration

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom Database Authentication (no Supabase Auth required)
- **Routing**: React Router v6
- **Icons**: Lucide React

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TIMEZONE=Europe/Vilnius
```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Setup

The database migrations are located in `supabase/migrations/`. To apply them:

1. Install Supabase CLI (if not already installed)
2. Link your project: `supabase link --project-ref your-project-ref`
3. Push migrations: `supabase db push`

Or manually run the SQL files in your Supabase SQL editor in this order:
1. `20251109151000_create_admin_tables.sql`
2. `20251109151100_update_admin_policies.sql`
3. `20251109152000_create_custom_admin_auth.sql`

## Admin Access

**IMPORTANT:** This system uses custom database authentication, NOT Supabase Auth. The client does not need access to Supabase dashboard.

### Security Features

- **Rate Limiting**: After 5 failed login attempts, the account is blocked for 1 minute
- **Session Management**: Sessions expire after 24 hours of inactivity (sliding window)
- **Password Hashing**: All passwords stored using bcrypt encryption
- **No Supabase Dashboard Required**: Authentication is completely self-contained in the database

### Login Process

1. Navigate to `/admin/login`
2. Enter email and password
3. System validates credentials against `admin_users` table
4. On success, creates session token stored in localStorage
5. Session automatically renewed on activity

### Admin Routes

- `/admin/login` - Authentication page
- `/admin/calendar` - Main scheduling interface
- `/admin/bookings` - Booking management
- `/admin/blogs` - Blog content management
- `/admin/reviews` - Review moderation
- `/admin/services` - Service configuration
- `/admin/settings` - Business settings

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   │   ├── AdminGuard.tsx
│   │   └── AdminShell.tsx
│   ├── reservation/    # Booking flow components
│   └── ...             # Public site components
├── pages/
│   └── admin/          # Admin dashboard pages
├── hooks/
│   └── useAuth.ts      # Authentication hook
├── lib/
│   ├── supabase.ts     # Supabase client
│   └── services/       # API service functions
├── utils/
│   └── datetime.ts     # Timezone utilities
└── main.tsx            # App entry point with routing
```

## Features in Detail

### Booking System
- Real-time availability checking
- Conflict prevention (overlapping bookings)
- Working hours management
- Date-specific overrides
- Time blocks for unavailable periods

### Blog System
- Markdown editor with live preview
- Featured posts
- Tags and categories
- Reading time calculation
- SEO-friendly slugs

### Admin Dashboard
- Luxury brand aesthetic (deep navy, gold accents)
- Dark mode support
- Mobile-responsive
- Real-time data updates
- Comprehensive audit logging

## Security

- **Custom Authentication**: Database-stored credentials with bcrypt hashing
- **Rate Limiting**: 5 failed attempts = 1 minute block
- **Session Management**: Secure token-based sessions with 24-hour expiry
- **Row Level Security (RLS)**: Enabled on all tables
- **Admin-only Access**: Policies restrict management operations to authenticated admins
- **Protected Routes**: Authentication guard on all admin pages
- **Audit Logging**: Track all admin actions
- **Environment Variable Protection**: Sensitive config never exposed to client

## Performance

- Optimized bundle size
- Lazy loading for admin routes
- Image optimization
- Efficient database queries with indexes

## License

Proprietary - All rights reserved

## Support

For technical support or questions, contact the development team.
