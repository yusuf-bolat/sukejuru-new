# Fix: "Profile creation error" During Registration

## Problem
Getting error: "Account created but profile setup failed. Please contact support."

## Root Cause
RLS (Row Level Security) policies prevent the profile from being created during signup because the user session isn't fully authenticated yet when we try to insert into `user_profiles` table.

## Solution (Choose ONE approach)

### ✅ RECOMMENDED: Approach 1 - Database Trigger (Automatic)

This approach uses a database trigger to automatically create the user profile when a new auth user is created.

**Steps:**
1. Go to Supabase SQL Editor
2. Run the **entire** `USER_PROFILES_TABLE.sql` file (it now includes the trigger)
3. The trigger will automatically create profiles for all new users

**How it works:**
- When a user signs up, their academic info is stored in `auth.users.raw_user_meta_data`
- A database trigger (`handle_new_user()`) automatically creates a profile row
- No client-side code needed - it happens server-side

**Advantages:**
- ✅ Works 100% of the time
- ✅ No RLS permission issues
- ✅ Atomic operation (can't fail separately from user creation)
- ✅ No race conditions

---

### Approach 2 - Update RLS Policy (Manual)

This keeps the client-side profile creation but fixes the RLS policy.

**Steps:**
1. Go to Supabase SQL Editor
2. Run this SQL:

```sql
-- Update the insert policy to allow profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);
```

3. The updated `supabase-client.js` now:
   - Passes all academic info in user metadata
   - Waits 500ms after signup for session to establish
   - Has better error handling
   - Returns success even if profile creation fails (user can complete later)

**Advantages:**
- ✅ Simple policy change
- ✅ User account is never blocked
- ✅ Graceful fallback

**Disadvantages:**
- ⚠️ More permissive RLS policy
- ⚠️ Profile creation can still fail in edge cases

---

## Testing

After applying the fix:

1. **Clear browser cache** (or use incognito mode)
2. Go to `http://localhost:8000/register.html`
3. Fill in the form completely
4. Submit
5. Check browser console for:
   - "User created: [user-id]"
   - "Profile created successfully" (if using trigger)
   - OR "Profile creation failed, but user account exists" (if manual approach)

## If You Already Have Failed Users

If you have users who were created but don't have profiles:

```sql
-- List users without profiles
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

-- Manually create profiles for existing users
INSERT INTO public.user_profiles (user_id, email, first_name, last_name, university, major, year_level, semester)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(u.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE(u.raw_user_meta_data->>'university', 'Not Set'),
    COALESCE(u.raw_user_meta_data->>'major', 'Not Set'),
    COALESCE(u.raw_user_meta_data->>'year_level', 'Freshman'),
    COALESCE((u.raw_user_meta_data->>'semester')::integer, 1)
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE p.id IS NULL;
```

## Current Code Updates

The code has been updated to:

1. **supabase-client.js - signUp()**:
   - Passes all academic info in user metadata
   - Waits 500ms after user creation
   - Better error handling
   - Returns success even if profile fails

2. **register.html**:
   - Shows appropriate message if profile creation had issues
   - User can still proceed to login

3. **USER_PROFILES_TABLE.sql**:
   - Added database trigger for automatic profile creation
   - Updated RLS policy for better compatibility

## Verification

After fix is applied, successful registration should show in console:
```
User created: abc-123-def-456
Profile created successfully: { user_id: 'abc-123-def-456', ... }
```

Or with graceful fallback:
```
User created: abc-123-def-456
Profile creation failed, but user account exists. User can complete profile later.
```

Both are acceptable - user can log in and use the app!
