# 🚀 AliNoor - Complete Blogging Platform

A beautiful, full-featured blogging platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Email/password and Google OAuth
- ✅ **User Profiles** - Complete profile system with name, country, birthdate, bio
- ✅ **Article Management** - Create, edit, publish, and delete articles
- ✅ **Search** - Full-text search across articles
- ✅ **Categories/Topics** - Organize articles by topics
- ✅ **View Tracking** - Count unique article views
- ✅ **Like System** - Like/unlike articles
- ✅ **Bookmarks** - Save articles for later
- ✅ **Author Profiles** - Display author names instead of emails

### UI/UX
- ✅ Beautiful, modern design with Tailwind CSS
- ✅ Responsive on all devices
- ✅ Smooth animations and transitions
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Elegant typography with custom fonts

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Supabase Account** ([supabase.com](https://supabase.com))
4. **Git** (optional, for version control)

---

## 🛠️ Installation

### Step 1: Extract the Project

Extract the `alinoor-platform.zip` file to your desired location:

```bash
unzip alinoor-platform.zip
cd alinoor-platform
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully set up
3. Go to **Project Settings** → **API**
4. Copy your:
   - Project URL
   - anon/public key

### Step 4: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Set Up the Database

1. Go to your Supabase project
2. Click on **SQL Editor** in the sidebar
3. Open the `database-schema.sql` file from the project
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run** to execute

This will create:
- `profiles` table (user information)
- `articles` table (blog posts)
- `article_views` table (view tracking)
- `article_likes` table (like system)
- `bookmarks` table (saved articles)
- All necessary functions and policies

### Step 6: Configure Google OAuth (Optional)

If you want to enable Google sign-in:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Google** provider
3. Follow Supabase's instructions to set up Google OAuth
4. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### Step 7: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 📁 Project Structure

```
alinoor-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   └── complete-profile/
│   │       └── page.tsx          # Profile completion
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx          # OAuth callback
│   ├── article/
│   │   └── [slug]/
│   │       └── page.tsx          # Article detail page
│   ├── bookmarks/
│   │   └── page.tsx              # Saved articles
│   ├── components/
│   │   ├── Navbar.tsx            # Main navigation
│   │   └── UserMenu.tsx          # User dropdown menu
│   ├── my-articles/
│   │   └── page.tsx              # User's articles
│   ├── search/
│   │   └── page.tsx              # Search results
│   ├── write/
│   │   └── page.tsx              # Create/edit articles
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   └── supabase.ts               # Supabase client
├── database-schema.sql           # Database setup
├── .env.local.example            # Environment variables template
├── .gitignore                    # Git ignore file
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 🎯 Usage Guide

### For Users

#### 1. **Sign Up**
- Click "Sign Up" on the login page
- Fill in your details:
  - Full Name
  - Country
  - Birth Date
  - Email & Password
  - Bio (optional)
- Verify your email
- Sign in

#### 2. **Create an Article**
- Click "Write" in the navbar
- Fill in:
  - Title
  - Topic/Category
  - Excerpt (summary)
  - Cover Image URL (optional)
  - Content
- Save as draft or publish

#### 3. **Edit Articles**
- Go to "My Articles"
- Click "Edit" on any article
- Make changes
- Save or republish

#### 4. **Interact with Articles**
- **Like** articles you enjoy
- **Bookmark** articles to read later
- View counts are tracked automatically

#### 5. **Search**
- Use the search bar in the navbar
- Search by title, excerpt, or content
- Results show instantly

### For Admins

Articles go through a status flow:
1. **Draft** - Saved but not published
2. **Pending** - Submitted for review
3. **Approved** - Published and visible to all

To approve articles, update the status in Supabase:
```sql
UPDATE articles SET status = 'approved' WHERE id = 'article-id';
```

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      // Add more custom colors
    },
  },
},
```

### Change Fonts

Edit `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');

.font-serif {
  font-family: 'Your Font', serif;
}
```

### Modify Layout

All page components are in the `app/` directory. Edit any `.tsx` file to customize the layout.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variables
7. Deploy!

### Update Supabase for Production

After deploying, update your Supabase authentication settings:

1. Go to **Authentication** → **URL Configuration**
2. Add your production URL to:
   - Site URL
   - Redirect URLs

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use Row Level Security (RLS)** - Already set up in the schema
3. **Validate user input** - Frontend validation is in place
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use HTTPS in production** - Automatic with Vercel/Netlify

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection errors

**Solution:**
- Check `.env.local` has correct values
- Verify Supabase project is active
- Check network connection

### Issue: Database policies preventing actions

**Solution:**
- Run `database-schema.sql` again
- Check user is authenticated
- Verify RLS policies in Supabase dashboard

### Issue: Articles not showing

**Solution:**
- Articles must have `status = 'approved'`
- Update in Supabase or create an admin panel

### Issue: Google OAuth not working

**Solution:**
- Verify redirect URLs in Google Console
- Check Supabase authentication settings
- Ensure callback URL is correct

---

## 📚 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel / Netlify
- **Fonts:** Merriweather (serif), Inter (sans-serif)

---

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🎉 You're All Set!

Your AliNoor blogging platform is ready to use!

**Quick Start Commands:**

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

**Next Steps:**

1. ✅ Create your first account
2. ✅ Write your first article
3. ✅ Customize the design
4. ✅ Deploy to production
5. ✅ Share with the world!

---

## 📧 Support

If you need help:
1. Check this README
2. Review the database schema
3. Check Supabase documentation
4. Review Next.js documentation

---

Happy Writing! ✍️
