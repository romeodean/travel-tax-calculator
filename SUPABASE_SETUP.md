# ☁️ Supabase Cloud Sync Setup

This guide will help you set up cross-device data synchronization using Supabase (free tier).

## 🎯 What You'll Get

- ✅ **Automatic cloud sync** across all your devices
- ✅ **User authentication** - secure email/password login
- ✅ **Free forever** (up to 500MB database)
- ✅ **Fallback to localStorage** if cloud fails
- ✅ **Secure user isolation** - each user only sees their own data

## 📋 Prerequisites

- A GitHub account (you already have this!)
- 5 minutes of your time

---

## 🚀 Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New Project"**
5. Fill in:
   - **Name**: `travel-tax-calculator`
   - **Database Password**: (generate a strong one, save it somewhere)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
6. Click **"Create new project"**
7. ⏳ Wait 2-3 minutes for setup

---

## 🗄️ Step 2: Create Database Tables

Once your project is ready:

1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New Query"**
3. Paste this SQL code:

```sql
-- Create travel_entries table
CREATE TABLE travel_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  departure_country TEXT NOT NULL,
  arrival_country TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  arrival_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_travel_entries_user_id ON travel_entries(user_id);

-- Create country_rules table
CREATE TABLE country_rules (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  country_code TEXT NOT NULL,
  name TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  calendar_type TEXT NOT NULL,
  description TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_country_rules_user_id ON country_rules(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE travel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Users can only access their own data
CREATE POLICY "Users can access own travel entries"
  ON travel_entries
  FOR ALL
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can access own country rules"
  ON country_rules
  FOR ALL
  USING (user_id = auth.uid()::text);

-- Optional: Allow legacy deviceId-based access (for backwards compatibility)
-- Remove these if you only want authenticated access
CREATE POLICY "Allow deviceId access to travel entries"
  ON travel_entries
  FOR ALL
  USING (user_id LIKE 'device_%');

CREATE POLICY "Allow deviceId access to country rules"
  ON country_rules
  FOR ALL
  USING (user_id LIKE 'device_%');
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see: **"Success. No rows returned"**

---

## 🔑 Step 3: Get Your API Keys

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. Find these two values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long string)

---

## 💻 Step 4: Configure Your App

### Local Development:

1. In your project folder, create a file called `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-long-key-here...
```

2. Replace the values with YOUR actual URL and key from Step 3

3. Restart your dev server:
```bash
npm run dev
```

4. ✅ You should now see **"☁️ Cloud sync enabled"** at the top of your app!

### Vercel Deployment:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add both variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your key
4. Redeploy your app

---

## 🧪 Step 5: Test It!

### First Time User Flow

1. **Visit the app** (http://localhost:3000 or your Vercel URL)
2. **See the login screen** with email and password fields
3. **Create an account**:
   - Click "Don't have an account? Sign up"
   - Enter email: `test@example.com`
   - Enter password: `password123` (minimum 6 characters)
   - Click "CREATE ACCOUNT"
4. **Add travel data**:
   - Add a travel entry
   - You should see "✓ Synced to cloud"
5. **Sign out**: Click "Sign out" in the header
6. **Test cross-device sync**:
   - Open the app on another device (or browser)
   - Sign in with the same email/password
   - Your data should appear! 🎉

### How Authentication & Sync Works

The app now uses **Supabase Authentication** for secure, user-based cloud sync:

1. **User creates account** → Supabase Auth generates a unique user ID
2. **User signs in** → JWT session token stored securely
3. **Data is saved** → Associated with user ID (not device ID)
4. **User signs in on another device** → Same data appears automatically

**Key Benefits:**
- ✅ No need to manually sync device IDs
- ✅ Secure password-based authentication
- ✅ Each user's data is isolated and private
- ✅ Works across unlimited devices automatically

---

## 📊 Step 6: Monitor Usage (Optional)

1. In Supabase dashboard, click **"Database"**
2. Click **"Tables"**
3. You can see:
   - `travel_entries` - all your trips
   - `country_rules` - your country settings

---

## 🔒 Security Notes

- ✅ **User authentication** - Email/password login required
- ✅ **Row Level Security** enabled
- ✅ **User isolation** - Each user only sees their own data
- ✅ **Secure password storage** - Hashed by Supabase
- ✅ **JWT sessions** - Automatic token management
- ⚠️ **Email verification disabled** - For easier testing (enable in production)

### Security Features

**Authentication:**
- Passwords hashed with bcrypt
- JWT tokens for session management
- Automatic token refresh
- Secure password requirements (min 6 characters)

**Data Privacy:**
- Row Level Security (RLS) policies enforce user isolation
- Users can only query/modify their own data
- Auth user ID (`auth.uid()`) used for access control

**Optional: Enable Email Verification**
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Enable email confirmations"
3. Configure email templates (optional)
4. Users must verify email before accessing data

---

## ❓ Troubleshooting

### "Cloud sync enabled" doesn't show up
- Check `.env.local` file exists and has correct values
- Restart dev server: `npm run dev`
- Check browser console for errors

### Data not syncing
- Check Supabase dashboard → Database → Tables
- Look for errors in browser console (F12)
- Verify tables were created correctly

### "Sync failed" message
- Check your Supabase project is running (not paused)
- Verify API keys are correct
- Check network tab in browser dev tools

---

## 💰 Pricing

**Free tier includes:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests

For a personal travel tracker, this is **more than enough**!

---

## 🎉 Done!

Your Travel Tax Calculator now syncs across all your devices automatically!

Next steps:
- Deploy to Vercel
- Share the URL with friends
- Travel the world! ✈️🌍
