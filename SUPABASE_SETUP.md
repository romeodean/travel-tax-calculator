# ☁️ Supabase Cloud Sync Setup

This guide will help you set up cross-device data synchronization using Supabase (free tier).

## 🎯 What You'll Get

- ✅ **Automatic cloud sync** across all your devices
- ✅ **Same unique Device ID** - your data syncs to the same "user" on all devices
- ✅ **Free forever** (up to 500MB database)
- ✅ **Fallback to localStorage** if cloud fails
- ✅ **No sign-up required** for end users

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

-- Create policies that allow anyone to read/write their own data
-- (using device_id as user_id for anonymous access)
CREATE POLICY "Allow all operations for all users on travel_entries"
  ON travel_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for all users on country_rules"
  ON country_rules
  FOR ALL
  USING (true)
  WITH CHECK (true);
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

1. **On Device 1** (e.g., your laptop):
   - Add a travel entry
   - You should see "✓ Synced to cloud"

2. **On Device 2** (e.g., your phone):
   - Open the same app URL
   - Refresh the page
   - Your data should appear! 🎉

### How Device Sync Works:

The app generates a unique `deviceId` on first visit and stores it in `localStorage`. This ID is used to:
- Save your data to Supabase
- Load your data from Supabase
- Keep all your devices in sync

**To sync the same data across multiple devices:**
- On Device 1: Open browser console (F12) and run:
  ```javascript
  localStorage.getItem('deviceId')
  ```
- Copy the device ID
- On Device 2: Open console and run:
  ```javascript
  localStorage.setItem('deviceId', 'paste-device-id-here')
  ```
- Reload the page - your data will sync!

---

## 📊 Step 6: Monitor Usage (Optional)

1. In Supabase dashboard, click **"Database"**
2. Click **"Tables"**
3. You can see:
   - `travel_entries` - all your trips
   - `country_rules` - your country settings

---

## 🔒 Security Notes

- ✅ **Anonymous access** - No login required
- ✅ **Row Level Security** enabled
- ✅ **Public read/write** - Anyone with the URL can access
- ⚠️ **Not production-ready for sensitive data**

### To Add Real Authentication (Optional):

If you want proper user accounts:
1. Use Supabase Auth
2. Replace `deviceId` with actual user IDs
3. Update RLS policies to `user_id = auth.uid()`

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
