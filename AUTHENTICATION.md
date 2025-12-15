# Authentication System

## Overview

The Travel Tax Calculator now uses **Supabase Authentication** to provide secure, user-based cloud sync across multiple devices. This replaces the previous device-based sync system.

## Features

### User Authentication
- **Email/Password Sign Up**: Create a new account with email and password
- **Email/Password Sign In**: Log in to existing accounts
- **Secure Sessions**: JWT-based authentication with automatic session management
- **Sign Out**: Safely log out and clear session

### Data Migration
- **Automatic Migration**: When you sign in for the first time on a device with existing local data, that data is automatically synced to your account
- **Migration Notice**: Users are informed when local data will be migrated
- **Backwards Compatible**: Old deviceId-based data is preserved in localStorage

### Cross-Device Sync
- **Real-time Sync**: All travel entries and country rules automatically sync to the cloud
- **Instant Access**: Sign in on any device to access your data
- **Conflict-Free**: User-based sync ensures your data is consistent across devices

## How It Works

### First-Time Users
1. Visit the app (with Supabase configured)
2. See the login/signup screen
3. Create an account with email and password
4. Start adding travel data
5. Data automatically syncs to cloud

### Existing Users (with Local Data)
1. Visit the app
2. See login screen with migration notice
3. Sign up or sign in
4. Local data automatically migrates to your account
5. Access your data from any device

### Returning Users
1. Visit the app
2. Sign in with your credentials
3. Your data loads automatically from the cloud
4. Any changes sync immediately

## Technical Details

### Authentication Flow
```
1. App loads → Check for current user session
2. If no session → Show AuthModal (login/signup)
3. User enters credentials → Call signIn() or signUp()
4. Successful auth → Store session, load user data
5. On each data change → Sync to cloud with user_id
```

### User ID System
```typescript
// Priority order for user identification:
1. Authenticated user ID (from Supabase Auth)
2. Device ID (fallback for backwards compatibility)

// In lib/sync.ts:
const getUserId = async (): Promise<string> => {
  const user = await getCurrentUser();
  if (user) return user.id; // Use real user ID

  // Fallback to deviceId (for anonymous/legacy users)
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random()}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};
```

### Data Storage
- **Local**: localStorage (offline-first, immediate access)
- **Cloud**: Supabase PostgreSQL (persistent, cross-device)
- **Sync**: Automatic on every change (with visual status indicator)

### Database Tables
```sql
-- travel_entries table
user_id TEXT (references auth.users.id or legacy deviceId)
id TEXT PRIMARY KEY
departure_country TEXT
arrival_country TEXT
departure_date TEXT
arrival_date TEXT

-- country_rules table
user_id TEXT (references auth.users.id or legacy deviceId)
country_code TEXT
name TEXT
threshold INTEGER
calendar_type TEXT
description TEXT
is_custom BOOLEAN
```

## UI Components

### AuthModal
- **Location**: app/page.tsx (lines 309-452)
- **Features**:
  - Toggle between sign in and sign up
  - Email and password validation
  - Error handling with user-friendly messages
  - Migration notice when local data exists
  - Loading states during authentication
  - Styled to match the beige monospace theme

### Header Updates
- **User Email Display**: Shows currently logged-in user
- **Sign Out Button**: Quick logout with confirmation
- **Sync Status**: Visual indicator of cloud sync status

## Security

### Password Requirements
- Minimum 6 characters (enforced by Supabase)
- Hashed and stored securely by Supabase
- Never stored in localStorage or client-side code

### Session Management
- JWT tokens managed by Supabase
- Automatic token refresh
- Secure HTTP-only cookies (when configured)

### Row Level Security (RLS)
**IMPORTANT**: You should enable RLS policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE travel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can access own travel entries"
  ON travel_entries
  FOR ALL
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can access own country rules"
  ON country_rules
  FOR ALL
  USING (user_id = auth.uid()::text);
```

## Files Modified

### New Files
- `lib/auth.ts` - Authentication utilities (signUp, signIn, signOut, getCurrentUser)

### Modified Files
- `lib/sync.ts` - Updated to use user-based IDs instead of deviceId
- `app/page.tsx` - Added AuthModal component and authentication flow
- All database operations now use async getUserId()

## Configuration

### Environment Variables
Already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://ztomothkgmonbrijbzyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SenP91laRwby-e1nHMfafw_sp4qTP1U
```

### Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to Authentication → Settings
4. Configure email settings (optional)
5. Enable/disable email confirmations (currently disabled for easier testing)

## Testing

### Test Account Creation
1. Visit http://localhost:3002
2. Click "Don't have an account? Sign up"
3. Enter email: test@example.com
4. Enter password: password123
5. Click "CREATE ACCOUNT"
6. Add some travel data
7. Sign out
8. Sign in on another browser/device
9. Verify data syncs

### Test Data Migration
1. Clear Supabase auth session (or use incognito)
2. Add travel data (creates local data)
3. Sign up with new account
4. Verify migration notice appears
5. Complete signup
6. Verify local data was migrated to account

## Troubleshooting

### "Supabase not configured" Error
- Check `.env.local` has correct values
- Restart dev server: `npm run dev`
- Verify Supabase project is active

### Authentication Fails
- Check Supabase Auth is enabled in dashboard
- Verify email confirmations are disabled (for testing)
- Check browser console for detailed errors

### Data Not Syncing
- Check network tab for API calls
- Verify user is authenticated (email shown in header)
- Check Supabase table browser for user_id
- Ensure RLS policies allow access

### Can't Sign In
- Verify account exists in Supabase Auth dashboard
- Check password is correct (minimum 6 characters)
- Try "Forgot Password" flow (if configured)

## Future Enhancements

### Potential Improvements
- **Email Verification**: Require email confirmation before access
- **Password Reset**: Forgot password flow
- **Social Auth**: Sign in with Google, GitHub, etc.
- **Profile Management**: Update email, password, delete account
- **Offline Mode**: Better offline support with conflict resolution
- **Data Export**: Download all data for a user
- **Multi-tenant**: Support for multiple users sharing data (families, teams)

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase Auth docs: https://supabase.com/docs/guides/auth
3. Check application logs in browser console
4. Review Supabase dashboard logs
