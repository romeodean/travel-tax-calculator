# 🔄 How Cross-Device Sync Works

## 📱 The Complete Flow

### **When You First Visit the App**

```
1. Browser opens app
   ↓
2. App generates unique deviceId: "device_1734234567_abc123"
   ↓
3. Saves to localStorage: localStorage.setItem('deviceId', 'device_...')
   ↓
4. This ID is YOUR identifier across all devices
```

### **When You Add/Edit Travel Data**

```
1. You add a trip: US → AU, Dec 1-15
   ↓
2. App saves BOTH places simultaneously:
   ├─ localStorage (instant, local)
   └─ Supabase Cloud (sends to database)
   ↓
3. You see: "✓ Synced to cloud" (2 seconds)
   ↓
4. Data is now in:
   ├─ Your browser (localStorage)
   └─ Supabase cloud database
```

### **When You Open App on Another Device**

```
1. New device opens app
   ↓
2. Gets a DIFFERENT deviceId: "device_1734234999_xyz789"
   ↓
3. Loads from Supabase using this NEW ID
   ↓
4. Finds NO DATA (different ID!)
   ↓
Result: Empty app (this is expected!)
```

## 🔑 How to Sync Across Devices

### **Option 1: Share Device ID (Simple)**

**Device 1 (has data):**
1. Open browser console (F12)
2. Run: `localStorage.getItem('deviceId')`
3. Copy the ID: `device_1734234567_abc123`

**Device 2 (needs data):**
1. Open browser console (F12)
2. Run: `localStorage.setItem('deviceId', 'device_1734234567_abc123')`
3. Reload page
4. ✅ Data appears!

### **Option 2: Export/Import (Also works)**

**Device 1:**
1. Click "⬇ Download Backup"
2. Save JSON file

**Device 2:**
1. Click "⬆ Import Data"
2. Select JSON file
3. ✅ Data imported!

This also uploads to cloud with Device 2's ID.

## 🗄️ Database Structure

### **Supabase Tables**

#### `travel_entries` table:
| Column | Type | Example |
|--------|------|---------|
| id | TEXT | "1734234567890" |
| user_id | TEXT | "device_1734234567_abc123" |
| departure_country | TEXT | "US" |
| arrival_country | TEXT | "AU" |
| departure_date | TEXT | "2024-12-01" |
| arrival_date | TEXT | "2024-12-15" |

#### `country_rules` table:
| Column | Type | Example |
|--------|------|---------|
| id | SERIAL | 1, 2, 3... |
| user_id | TEXT | "device_1734234567_abc123" |
| country_code | TEXT | "AU" |
| name | TEXT | "Australia" |
| threshold | INTEGER | 183 |
| calendar_type | TEXT | "calendar-year" |
| is_custom | BOOLEAN | false |

## 🔄 Sync Logic

### **On Page Load:**
```typescript
1. Check if Supabase configured ✓
2. Try load from cloud:
   - Query: SELECT * FROM travel_entries WHERE user_id = 'device_...'
   - If found → Use cloud data
   - If not found → Use localStorage
3. Fallback to localStorage if cloud fails
```

### **On Data Change:**
```typescript
1. Save to localStorage (instant)
2. Send to Supabase cloud:
   - DELETE FROM travel_entries WHERE user_id = 'device_...'
   - INSERT new data
3. Show sync status:
   - "☁️ Syncing..." → "✓ Synced to cloud" → "☁️ Cloud sync enabled"
```

## ✅ How to Test Supabase is Working

### **Test 1: Check Console Logs**
1. Open browser console (F12)
2. Add a travel entry
3. Look for:
   ```
   ✅ Synced travel entries to cloud
   ✅ Synced country rules to cloud
   ```

### **Test 2: Check Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ztomothkgmonbrijbzyd)
2. Click **"Table Editor"**
3. View `travel_entries` table
4. You should see your data!

### **Test 3: Clear localStorage & Reload**
1. Open console (F12)
2. Run: `localStorage.clear()`
3. Reload page
4. If data reappears → ✅ Cloud sync working!
5. If data gone → ❌ Check Supabase tables

### **Test 4: Cross-Device (Advanced)**
1. **Laptop**: Add a trip, note your deviceId
2. **Phone**: Open same URL
3. **Phone Console**: Set same deviceId
4. **Phone**: Reload
5. If data appears → ✅ Perfect sync!

## 🚨 Current Limitation

**Each device has its own ID by default.**

This is intentional for privacy/simplicity, but means:
- ❌ Data doesn't "magically" appear on new devices
- ✅ You control which devices see your data
- ✅ Export/Import always works
- ✅ Sharing deviceId makes true sync work

## 🔮 Future: User Authentication (Optional)

To make it truly cross-device without manual steps:

### **Add Supabase Auth:**
```typescript
// Replace deviceId with actual user login
const { user } = await supabase.auth.signInWithGoogle()
const userId = user.id // Same across ALL devices!
```

**Benefits:**
- ✅ Automatic sync across devices
- ✅ Secure (each user sees only their data)
- ✅ No manual deviceId sharing

**Trade-off:**
- ❌ Requires login (email/Google/etc)
- ❌ More complex setup

## 📊 Current Architecture

```
┌─────────────────────────────────────┐
│         Your Browser                │
│  ┌──────────────────────────────┐  │
│  │     localStorage             │  │
│  │  - travelEntries             │  │
│  │  - countryRules              │  │
│  │  - deviceId                  │  │
│  └──────────────────────────────┘  │
│              ↕                      │
│  ┌──────────────────────────────┐  │
│  │     React State              │  │
│  │  - entries                   │  │
│  │  - countries                 │  │
│  └──────────────────────────────┘  │
│              ↕                      │
│  ┌──────────────────────────────┐  │
│  │     Supabase Client          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
              ↕
    ☁️ Supabase Cloud ☁️
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│  ┌──────────────────────────────┐  │
│  │   travel_entries table       │  │
│  │   (user_id → data)           │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   country_rules table        │  │
│  │   (user_id → settings)       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 💡 Pro Tips

### **Backup Strategy:**
1. **Weekly**: Download backup (⬇ button)
2. **Monthly**: Save to Google Drive / Dropbox
3. **Before trips**: Export and email to yourself

### **Multi-Device Workflow:**
1. **Use Export/Import**: Easiest for occasional sync
2. **Share deviceId**: Best for frequent multi-device use
3. **Future**: Add auth for automatic sync

### **Privacy:**
- Data lives in YOUR Supabase account
- Only you have the API keys
- deviceId is random, not linked to you
- Can delete everything anytime

## 🎯 Summary

**Does it auto-save?**
✅ YES - Every change saves to localStorage AND cloud

**Across all devices?**
⚠️ PARTIALLY - Need to share deviceId OR use Export/Import

**How does database work?**
- Uses deviceId as "user"
- Each deviceId has its own data
- Query by deviceId to get your data

**Is it working?**
✅ YES if you see "☁️ Cloud sync enabled"
✅ Check Supabase dashboard to verify data exists
✅ Try the tests above to confirm
