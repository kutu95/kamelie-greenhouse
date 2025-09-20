# Kamelie Greenhouse - Next.js App

A modern web application for Kamelie Greenhouse, Germany's largest camellia collection. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🌍 **Internationalization** - German (default) and English support
- 🛒 **E-commerce** - Plant catalog with shopping cart and order management
- 👥 **User Management** - Authentication with role-based access control
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI** - Built with Radix UI components and shadcn/ui
- 🔐 **Security** - Row Level Security (RLS) with Supabase
- 📊 **Admin Dashboard** - Inventory and order management
- 🌱 **Plant Management** - Complete plant lifecycle tracking
- ❄️ **Winter Storage** - Service booking system
- 💬 **Consulting** - Customer inquiry management

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Internationalization**: next-intl
- **Data Fetching**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kamelie-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your Supabase project:
   - Create a new Supabase project
   - Run the database schema from `../database_schema.sql`
   - Add sample data from `../sample_data.sql`
   - Update `.env.local` with your Supabase credentials

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Kamelie Greenhouse"
NEXT_PUBLIC_DEFAULT_LANGUAGE=de

# Stripe Configuration (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `../database_schema.sql`
3. Import sample data from `../sample_data.sql`
4. Configure Row Level Security policies
5. Set up authentication providers

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase configuration
│   ├── store/            # Zustand stores
│   └── utils.ts          # Utility functions
├── messages/             # Internationalization files
│   ├── de.json          # German translations
│   └── en.json          # English translations
└── types/               # TypeScript type definitions
    └── database.ts      # Database types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate-types` - Generate database types from Supabase

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software owned by Kamelie Greenhouse.

## Support

For support, please contact the development team or create an issue in the repository.