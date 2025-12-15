# Debug Authentication & Sync Issues

## Problem: Data not syncing across browsers

If you sign in with the same account on different browsers but don't see the same data, follow these debugging steps:

---

## Step 1: Check RLS Policies in Supabase

**The most common issue is that Row Level Security policies haven't been updated.**

### Fix:
1. Go to Supabase Dashboard: https://app.supabase.com
2. Open your project: `travel-tax-calculator`
3. Click **SQL Editor** in left sidebar
4. Copy and paste the contents of `UPDATE_RLS_POLICIES.sql`
5. Click **Run** (or Cmd/Ctrl + Enter)
6. You should see: "RLS policies updated successfully!"

---

## Step 2: Check What's Actually in the Database

### View your data:
1. In Supabase Dashboard, click **Table Editor**
2. Click `travel_entries` table
3. Look at the `user_id` column:
   - ✅ **Good**: UUID like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - ❌ **Problem**: String like `device_1234567890_abc123`

If you see `device_*` IDs, that means the data was saved BEFORE you logged in, or there's a bug.

### Check user ID:
1. Click **Authentication** in left sidebar
2. Click **Users**
3. Find your test account email
4. Copy the **User UID** (this should match the user_id in your data)

---

## Step 3: Browser Console Debugging

### In Browser 1 (where you added data):
1. Open browser console (F12)
2. Type and run:
   ```javascript
   // Check auth state
   console.log('User:', await (await fetch('http://localhost:3002/api/auth/user')).json())

   // Check local storage
   console.log('Local entries:', localStorage.getItem('travelEntries'))
   console.log('Device ID:', localStorage.getItem('deviceId'))
   ```

3. Look for console messages:
   - Should see: `✅ Synced travel entries to cloud`
   - Should see: `✅ Synced country rules to cloud`

### In Browser 2 (where you're trying to see data):
1. Open console (F12)
2. Type and run:
   ```javascript
   // Check if user is authenticated
   console.log('Authenticated:', document.querySelector('main') !== null)

   // Check what's being loaded
   // (look in Network tab for calls to Supabase)
   ```

3. Look for:
   - Should see: `✅ Loaded X travel entries from cloud`
   - If you see: `No cloud data` or `0 entries` → RLS issue or data not synced

---

## Step 4: Manual Verification

### Test the sync manually:

**Browser 1 (Chrome):**
1. Sign in with: `test@example.com`
2. Add a travel entry: US → AU (any dates)
3. Open console, verify you see: `✅ Synced travel entries to cloud`
4. Sign out

**Browser 2 (Firefox or Incognito):**
1. Sign in with: `test@example.com` (same email!)
2. Wait 2-3 seconds for data to load
3. You should see the US → AU entry appear

**If it doesn't appear:**
- Open console in Browser 2
- Look for errors (usually says "permission denied" if RLS is wrong)
- Check Network tab for failed requests to Supabase

---

## Step 5: Common Issues & Fixes

### Issue: "permission denied for table travel_entries"
**Cause**: RLS policies not set up correctly
**Fix**: Run `UPDATE_RLS_POLICIES.sql` in Supabase SQL Editor

### Issue: Data shows in Browser 1 but not Browser 2
**Cause**: Data saved with deviceId, not user_id
**Fix**:
1. Delete the entry in Browser 1
2. Make sure you're signed in (email shows in header)
3. Re-add the entry
4. It should now sync correctly

### Issue: "Cloud sync enabled" doesn't show
**Cause**: Environment variables not loaded
**Fix**:
1. Check `.env.local` exists and has correct values
2. Restart dev server: `npm run dev`

### Issue: Can't sign in on Browser 2
**Cause**: Wrong password or account doesn't exist
**Fix**:
1. Go to Supabase Dashboard → Authentication → Users
2. Verify the email exists
3. If not, create account in Browser 2 (sign up, not sign in)

---

## Step 6: Force Re-sync

If data is still not syncing, try this:

### Browser 1:
```javascript
// In console:
// 1. Get your data
const entries = JSON.parse(localStorage.getItem('travelEntries'))
console.log('Local entries:', entries)

// 2. Force a re-sync by making a small edit
// Just add/delete an entry in the UI
```

### Browser 2:
```javascript
// In console:
// Force reload from cloud
location.reload()
```

---

## Step 7: Check Supabase Auth Session

### In browser console (any browser):
```javascript
// Check if Supabase session exists
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('User ID:', data.session?.user?.id)
```

Expected output:
- `session`: Should be an object (not null)
- `user.id`: Should be a UUID
- If both are null: You're not signed in

---

## Expected Behavior (Working Correctly)

### Browser 1 (after adding entry):
```
Console output:
✅ Synced travel entries to cloud
✅ Synced country rules to cloud

Database (travel_entries):
user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Browser 2 (after signing in):
```
Console output:
✅ Loaded 1 travel entries from cloud
✅ Loaded 10 country rules from cloud

UI shows:
- Same travel entry
- Same country rules
- User email in header
```

---

## Still Not Working?

### Last Resort Debugging:

1. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → API Logs
   - Look for errors or failed requests

2. **Check Network Tab:**
   - Open DevTools → Network
   - Filter by "supabase"
   - Look for 401/403 errors (permission denied)

3. **Verify Environment Variables:**
   ```bash
   # In terminal:
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Test Direct Supabase Connection:**
   - Supabase Dashboard → API Docs
   - Try a manual query with your anon key
   - If that fails, keys are wrong

---

## Quick Fix Checklist

- [ ] Ran `UPDATE_RLS_POLICIES.sql` in Supabase
- [ ] Verified user exists in Supabase Authentication → Users
- [ ] Checked console for "Synced to cloud" messages
- [ ] Verified user_id in database matches authenticated user
- [ ] Restarted dev server after updating .env.local
- [ ] Tried signing out and back in
- [ ] Cleared localStorage and re-added data while signed in

---

Need more help? Check browser console for specific error messages and share them!
