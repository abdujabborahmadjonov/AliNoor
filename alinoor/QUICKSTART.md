# 🚀 Quick Start Guide

Get AliNoor running in 5 minutes!

## 1️⃣ Extract & Install

```bash
# Extract the ZIP file
unzip alinoor-platform.zip
cd alinoor-platform

# Install dependencies
npm install
```

## 2️⃣ Set Up Supabase

1. Go to https://supabase.com and create account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL
   - anon/public key

## 3️⃣ Configure Environment

```bash
# Create environment file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials
```

Your `.env.local` should look like:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 4️⃣ Set Up Database

1. Open Supabase project
2. Go to **SQL Editor**
3. Open `database-schema.sql` file
4. Copy ALL the SQL code
5. Paste in SQL Editor
6. Click **RUN**

✅ This creates all tables, functions, and security policies!

## 5️⃣ Run the App

```bash
npm run dev
```

Open http://localhost:3000 🎉

## 6️⃣ Create Your First Account

1. Click "Sign Up"
2. Fill in your details
3. Check email for verification
4. Sign in and start writing!

---

## 🎯 That's It!

You now have a fully functional blogging platform with:
- User authentication
- Article creation & editing
- Search functionality
- Like & bookmark system
- View tracking
- Beautiful UI

## 📖 Next Steps

- Read the full `README.md` for detailed documentation
- Customize colors in `tailwind.config.js`
- Modify layouts in `app/` directory
- Deploy to Vercel or Netlify

## 🆘 Need Help?

Check the main README.md file for:
- Detailed setup instructions
- Troubleshooting guide
- Deployment instructions
- Customization tips

Happy writing! ✍️
