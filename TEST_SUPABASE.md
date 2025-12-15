# 🧪 Test Supabase Connection

## Quick Test in Browser Console

1. Open your app: http://localhost:3002 (or your Vercel URL)
2. Open browser console: Press **F12** or **Cmd+Option+J** (Mac)
3. Paste this code and press Enter:

```javascript
// Test Supabase connection
async function testSupabase() {
  console.log('🧪 Testing Supabase connection...');

  // Check if configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set ✓' : 'not set ✗';

  console.log('📍 Supabase URL:', url);
  console.log('🔑 API Key:', key);

  // Check localStorage
  const deviceId = localStorage.getItem('deviceId');
  console.log('📱 Device ID:', deviceId);

  // Check for existing data
  const entries = localStorage.getItem('travelEntries');
  const countries = localStorage.getItem('countryRules');

  console.log('💾 Local entries:', entries ? JSON.parse(entries).length + ' entries' : 'none');
  console.log('🌍 Local countries:', countries ? Object.keys(JSON.parse(countries)).length + ' countries' : 'none');

  console.log('\n✅ If you see "Cloud sync enabled" at top of page, Supabase is configured!');
  console.log('📊 Now add a travel entry and check Supabase dashboard.');
}

testSupabase();
```

## Expected Output

If Supabase is working, you should see:

```
🧪 Testing Supabase connection...
📍 Supabase URL: https://ztomothkgmonbrijbzyd.supabase.co
🔑 API Key: set ✓
📱 Device ID: device_1734234567_abc123
💾 Local entries: 0 entries
🌍 Local countries: 10 countries

✅ If you see "Cloud sync enabled" at top of page, Supabase is configured!
📊 Now add a travel entry and check Supabase dashboard.
```

## Step-by-Step Verification

### Step 1: Add Test Data
1. In the app, add a test trip:
   - From: **United States**
   - Departure: **2024-12-01**
   - To: **Australia**
   - Arrival: **2024-12-15**
2. Click **ADD ENTRY**
3. Watch for sync messages at top of page

### Step 2: Check Browser Console
Open console (F12) and look for:
```
✅ Loaded 10 country rules from cloud
✅ Synced travel entries to cloud
✅ Synced country rules to cloud
```

If you see these → **Supabase is working!** ✅

### Step 3: Verify in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ztomothkgmonbrijbzyd
2. Click **"Table Editor"** (in left sidebar)
3. Click **"travel_entries"** table
4. You should see 1 row with your test trip!

**What you'll see:**
| id | user_id | departure_country | arrival_country | departure_date | arrival_date |
|----|---------|-------------------|-----------------|----------------|--------------|
| 173... | device_... | US | AU | 2024-12-01 | 2024-12-15 |

5. Click **"country_rules"** table
6. You should see 10 rows (all your countries)

### Step 4: Test Cross-Device Sync

#### Option A: Test with localStorage Clear
1. **Before**: Note your deviceId in console
2. **Clear**: Run `localStorage.clear()` in console
3. **Reload**: Refresh page (F5)
4. **Result**: Data should reload from cloud!

#### Option B: Test with Incognito Window
1. **Main Window**: Your data is there
2. **Incognito**: Open same URL in incognito/private window
3. **Set DeviceId**: In incognito console:
   ```javascript
   localStorage.setItem('deviceId', 'YOUR_DEVICE_ID_FROM_MAIN_WINDOW')
   ```
4. **Reload**: Refresh incognito window
5. **Result**: Same data appears!

## Troubleshooting

### ❌ No "Cloud sync enabled" message

**Problem**: Environment variables not loaded

**Fix**:
1. Check `.env.local` file exists
2. Restart dev server: `npm run dev`
3. For Vercel: Check env vars in dashboard

### ❌ Console shows errors

**Check for**:
```
Failed to sync travel entries: ...
```

**Common causes**:
1. **Tables not created**: Run SQL from SUPABASE_SETUP.md
2. **Wrong API key**: Check .env.local
3. **Network issue**: Check internet connection

**Fix**:
1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Paste table creation SQL
4. Run it

### ❌ Data in localStorage but not Supabase

**Problem**: Sync is failing silently

**Test**:
```javascript
// In browser console
import { supabase } from '@/lib/supabase'

// Try manual query
const { data, error } = await supabase
  .from('travel_entries')
  .select('*')

console.log('Data:', data)
console.log('Error:', error)
```

**Common fixes**:
1. Check Supabase project is active (not paused)
2. Verify RLS policies are set (see SUPABASE_SETUP.md)
3. Check API key has correct permissions

## 🎯 Quick Verification Checklist

- [ ] "☁️ Cloud sync enabled" shows at top of page
- [ ] Console shows "✅ Synced..." messages when adding data
- [ ] Supabase dashboard shows data in tables
- [ ] localStorage.clear() + reload still shows data
- [ ] Can export/import successfully

If all checked ✅ → **Supabase is working perfectly!**

## 📊 Verify on Vercel (Production)

After deploying to Vercel:

1. Go to your Vercel URL
2. Add test data
3. Check Supabase dashboard
4. Should see data with different deviceId

**Note**: Vercel production = different deviceId than localhost!

To sync:
- Export from localhost → Import to Vercel
- Or manually set same deviceId on both

## 🔧 Debug Mode

Add this to see detailed sync logs:

```javascript
// In browser console
localStorage.setItem('debug', 'true')
// Reload page
```

Then watch console for detailed sync information.

## ✅ Success Indicators

You'll know it's working when:
1. ☁️ Icon at top of page
2. Console logs show successful syncs
3. Supabase tables populate
4. Data persists after localStorage.clear()
5. Can see data on Supabase dashboard

🎉 **Congratulations! Your cross-device sync is working!**
