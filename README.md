# Kamelie Greenhouse

A modern, multilingual Next.js application for Kamelie Greenhouse - Germany's largest camellia collection. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🌸 Features

- **Multilingual Support** - German and English with next-intl
- **Plant Catalog** - Browse over 3,000 camellia plants with detailed information
- **Admin Dashboard** - Complete plant, user, and order management
- **User Authentication** - Secure registration and login with Supabase
- **Services Page** - Professional camellia care services
- **Responsive Design** - Beautiful UI that works on all devices
- **Image Gallery** - Extensive collection of camellia photos

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Internationalization**: next-intl
- **UI Components**: Shadcn/UI
- **State Management**: Zustand
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kamelie-greenhouse.git
   cd kamelie-greenhouse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   RESEND_API_KEY=your_resend_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL scripts in the `database/` folder to set up the schema
   - Configure Row Level Security (RLS) policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses the following main tables:
- `species` - Camellia species information
- `cultivars` - Camellia cultivar details
- `plants` - Individual plant records
- `plant_photos` - Plant images
- `user_profiles` - User account information
- `orders` - Customer orders
- `blog_posts` - Blog content

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Set environment variables**
   - Add all required environment variables in Vercel dashboard
   - Make sure to update `NEXT_PUBLIC_APP_URL` to your production domain

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the database schema scripts
3. Set up authentication providers
4. Configure email templates (optional - uses Resend for custom emails)

### Email Configuration

The app uses Resend for sending emails:
1. Sign up for a Resend account
2. Get your API key
3. Add it to your environment variables
4. Verify your domain (for production)

## 📱 Pages

- **Home** (`/`) - Landing page with hero section and features
- **Catalog** (`/catalog`) - Browse and search camellia plants
- **Services** (`/services`) - Professional camellia care services
- **Admin** (`/admin`) - Administrative dashboard (admin only)
- **Auth** (`/auth/login`, `/auth/register`) - User authentication

## 🎨 Customization

### Adding New Languages

1. Create a new message file in `src/messages/`
2. Add the locale to `src/lib/i18n.ts`
3. Update the middleware configuration

### Styling

The app uses Tailwind CSS with custom components. Main styling files:
- `src/app/globals.css` - Global styles
- `src/components/ui/` - Reusable UI components
- Component-specific styles use Tailwind classes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email info@kamelie.net or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/UI](https://ui.shadcn.com/) - UI component library
- [Lucide](https://lucide.dev/) - Icon library

---

Built with ❤️ for Kamelie Greenhouse