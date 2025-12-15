# Quick Debug: Check Browser Console

## What to Do

### In Both Browsers:

1. **Open Developer Console**: Press F12 (or Cmd+Option+I on Mac)
2. **Go to Console tab**
3. **Sign in with the same account in both browsers**
4. **Look for these console messages:**

---

## Expected Console Output

### Browser 1 (where you add data):

When you sign in:
```
🔍 Loading travel entries for user: <user-id>
📭 No travel entries found in cloud for this user
(or)
✅ Loaded X travel entries from cloud
```

When you add an entry:
```
💾 Saving 1 travel entries for user: <user-id>
✅ Synced travel entries to cloud
```

### Browser 2 (where data should appear):

When you sign in:
```
🔍 Loading travel entries for user: <same-user-id>
✅ Loaded 1 travel entries from cloud
```

---

## What to Check

### 1. User ID Match
**Both browsers should show the SAME user ID**

If they're different:
- ❌ You're not signed in as the same user
- ❌ Or auth is not working

### 2. Look for Error Messages

**Common errors:**

#### "new row violates row-level security policy"
```
❌ Error inserting entries: {code: "42501", message: "new row violates..."}
```
**Cause**: RLS policies not updated
**Fix**: Run `UPDATE_RLS_POLICIES.sql` in Supabase

#### "permission denied for table travel_entries"
```
❌ Database error loading entries: {code: "42501", message: "permission denied..."}
```
**Cause**: RLS policies blocking access
**Fix**: Run `UPDATE_RLS_POLICIES.sql` in Supabase

#### "No travel entries found in cloud"
```
📭 No travel entries found in cloud for this user
```
**Possible causes**:
- Data wasn't saved (check Browser 1 console)
- RLS policies are blocking the query
- Wrong user ID

---

## Step-by-Step Test

### Step 1: Browser 1 (Chrome)
1. Open http://localhost:3002
2. Open Console (F12)
3. Sign in or create account
4. **Copy the user ID** from console (after "Loading travel entries for user:")
5. Add a travel entry
6. Look for: `✅ Synced travel entries to cloud`

### Step 2: Browser 2 (Firefox/Incognito)
1. Open http://localhost:3002
2. Open Console (F12)
3. Sign in with **exact same email/password**
4. Check the user ID - **should match Browser 1**
5. Look for: `✅ Loaded 1 travel entries from cloud`

### Step 3: If Data Doesn't Appear in Browser 2

**Check console for one of these:**

**A) Shows "No travel entries found"**
→ Data wasn't saved or RLS is blocking
→ Check Supabase Table Editor to see if data exists

**B) Shows RLS error (42501)**
→ Run `UPDATE_RLS_POLICIES.sql` in Supabase SQL Editor

**C) Shows different user ID**
→ Not signed in as same user - sign out and try again

---

## Quick Supabase Check

1. Go to: https://app.supabase.com
2. Open your project
3. Click **Table Editor** → `travel_entries`
4. Look at the data:
   - Is there any data? If no → it wasn't saved
   - Check the `user_id` column → should match your console user ID
   - If `user_id` starts with "device_" → that's old data, delete it

---

## Most Likely Issue: RLS Policies

If you see error code `42501`, you MUST update RLS policies:

1. Supabase Dashboard → **SQL Editor**
2. Paste contents of `UPDATE_RLS_POLICIES.sql`
3. Click **Run**
4. Refresh both browsers
5. Try again

---

## What the Console Messages Mean

- 🔍 = Attempting to load data
- 💾 = Attempting to save data
- ✅ = Success
- ❌ = Error (read the message!)
- 📭 = No data found (might be okay if first time)

---

Share the console output and I can help debug further!
