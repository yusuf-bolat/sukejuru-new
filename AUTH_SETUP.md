# Authentication Setup Guide

## Overview
This guide will help you set up user authentication for the Fantastical Calendar app. Users will need to register and sign in to access their personal schedules and todo lists.

## Database Setup (Run in Supabase SQL Editor)

### 1. Create User Profiles Table
Run the SQL in `USER_PROFILES_TABLE.sql` to create the table for storing extended user information (university, major, year, semester).

```sql
-- This creates:
-- - user_profiles table with academic information
-- - Indexes for performance
-- - RLS policies for security
-- - Auto-update triggers for timestamps
```

### 2. Update Row Level Security Policies
Run the updated `RLS_POLICY.sql` to secure your data:

```sql
-- This updates:
-- - Events table policies (users see only their own events)
-- - Todos table policies (users see only their own todos)
-- - Removes anonymous access
-- - Enforces authentication
```

### 3. Enable Email Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Make sure **Email** provider is enabled
4. Configure email templates (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

### 4. Configure Email Settings (Optional but Recommended)

For production, configure custom SMTP:
1. Go to **Authentication** → **Email Templates**
2. Click **Settings**
3. Add your SMTP server details (SendGrid, Mailgun, etc.)

For development, Supabase's default email service works fine.

## Application Flow

### New Users
1. Visit `register.html`
2. Fill in:
   - Email and password
   - First name and last name
   - University name
   - Major
   - Year level (Freshman/Sophomore/Junior/Senior/Graduate)
   - Semester (1st or 2nd)
3. Submit registration
4. Check email for verification link (Supabase sends this automatically)
5. Verify email
6. Go to `login.html` and sign in

### Existing Users
1. Visit `login.html`
2. Enter email and password
3. Click "Sign In"
4. Redirected to `index.html` with personal calendar

### Forgot Password
1. On `login.html`, click "Forgot password?"
2. Enter email address
3. Check email for password reset link
4. Follow link to reset password

## How It Works

### Authentication Check
Every time a user visits `index.html`:
```javascript
// 1. Check if user is authenticated
const isAuthenticated = await window.requireAuth();
if (!isAuthenticated) {
    // Redirects to login.html
    return;
}

// 2. Load user's profile
const profile = await window.getUserProfile();

// 3. Load user's events and todos (filtered by user ID)
const events = await fetchSupabaseEvents();
const todos = await fetchSupabaseTodos();
```

### Data Isolation
- **Events**: Each event has a `created_by` field with the user's ID
- **Todos**: Each todo has a `created_by` field with the user's ID
- **RLS Policies**: Database automatically filters data by `auth.uid() = created_by`
- **Result**: Users can ONLY see their own data

### User Profile Display
- User's name displayed in header: `John Doe`
- University displayed below name
- Logout button in top-right corner

## Files Added/Modified

### New Files
- `login.html` - Login page with email/password form
- `register.html` - Registration page with academic info
- `USER_PROFILES_TABLE.sql` - SQL for user profiles table
- `AUTH_SETUP.md` - This guide

### Modified Files
- `supabase-client.js` - Added auth functions:
  - `signUp(formData)`
  - `signIn(email, password)`
  - `signOut()`
  - `getSession()`
  - `getCurrentUser()`
  - `getUserProfile()`
  - `resetPassword(email)`
  - `requireAuth()`
  - Updated `fetchSupabaseEvents()` to filter by user
  - Updated `fetchSupabaseTodos()` to filter by user
  - Updated `saveEventToSupabase()` to add `created_by`
  - Updated `saveTodoToSupabase()` to add `created_by`

- `index.html` - Added:
  - Authentication check on page load
  - User profile display in header
  - Logout button
  - Automatic redirect to login if not authenticated

- `RLS_POLICY.sql` - Updated:
  - Removed anonymous access policies
  - Added authenticated user policies
  - Enforced user isolation with `created_by` field

## Testing the Authentication

### 1. Create a Test User
```
Email: test@university.edu
Password: testpass123
First Name: Test
Last Name: User
University: Test University
Major: Computer Science
Year Level: Sophomore
Semester: 1
```

### 2. Test Registration
- Go to `http://localhost:8000/register.html`
- Fill in the form
- Submit
- Check console for success message
- Check email for verification link

### 3. Test Login
- Go to `http://localhost:8000/login.html`
- Enter credentials
- Should redirect to `index.html`
- Should see user name in header

### 4. Test Data Isolation
- Create some events and todos as User A
- Sign out
- Create a different user (User B)
- Sign in as User B
- Verify you DON'T see User A's data
- Create events/todos as User B
- Sign out and sign back in as User A
- Verify User A still sees their own data

### 5. Test Logout
- Click logout button in header
- Should redirect to login page
- Try visiting `index.html` directly
- Should auto-redirect to login page

## Security Features

✅ **Passwords**: Hashed by Supabase Auth (bcrypt)
✅ **Sessions**: Managed by Supabase with secure tokens
✅ **Data Isolation**: RLS policies enforce user boundaries
✅ **Email Verification**: Required for new accounts
✅ **Password Reset**: Secure token-based reset flow
✅ **Auto-logout**: Invalid sessions redirect to login

## Common Issues

### Issue: "User not authenticated" error
**Solution**: Make sure you're signed in. Clear browser cache and sign in again.

### Issue: Can't see events/todos after signing in
**Solution**: 
1. Check browser console for errors
2. Verify RLS policies are applied correctly
3. Check that `created_by` field is being set correctly

### Issue: Email verification not working
**Solution**: 
1. Check spam folder
2. In Supabase dashboard, go to Authentication → Users
3. Manually confirm the user's email (for testing)

### Issue: "Database connection not available"
**Solution**: Check that `.env.local` has correct Supabase credentials

## Next Steps

1. ✅ Run `USER_PROFILES_TABLE.sql` in Supabase
2. ✅ Run updated `RLS_POLICY.sql` in Supabase
3. ✅ Enable email authentication in Supabase dashboard
4. ✅ Test registration flow
5. ✅ Test login flow
6. ✅ Test data isolation
7. ✅ Customize email templates (optional)
8. ✅ Set up custom SMTP for production (optional)

## Academic Info Usage

The academic information collected during registration:
- **University**: Displayed in user profile
- **Major**: Available for future features (study group matching, course scheduling)
- **Year Level**: Can be used for filtering relevant content
- **Semester**: Helps with semester-specific planning

You can access this data anywhere:
```javascript
const profile = await window.getUserProfile();
console.log(profile.university); // "Harvard University"
console.log(profile.major);      // "Computer Science"
console.log(profile.year_level); // "Sophomore"
console.log(profile.semester);   // 1
```

## Production Checklist

Before deploying to production:
- [ ] Set up custom SMTP for reliable email delivery
- [ ] Customize email templates with your branding
- [ ] Set up password strength requirements
- [ ] Configure session timeout duration
- [ ] Enable MFA (Multi-Factor Authentication) for added security
- [ ] Set up monitoring for failed login attempts
- [ ] Create backup policies for user data
- [ ] Test password reset flow thoroughly
- [ ] Add terms of service and privacy policy links
- [ ] Set up analytics for user registration/login
