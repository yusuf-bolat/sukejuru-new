# Supabase Integration Guide

## Setup Instructions

### 1. Configure Environment Variables

Update the `.env.local` file with your Supabase project credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project dashboard under **Settings > API**.

### 2. Database Schema

The events table is already created in your Supabase database with the following structure:

- `id` - UUID primary key
- `title` - Event title (required)
- `description` - Event description
- `start_time` - Event start time (required)
- `end_time` - Event end time (required)
- `all_day` - Boolean flag for all-day events
- `color` - Hex color code for the event
- `location` - Event location
- `is_recurring` - Boolean flag for recurring events
- `series_id` - UUID for linking recurring events
- `recurrence_rule` - JSONB for recurrence rules
- `recurrence_end_date` - End date for recurring events
- `created_by` - Foreign key to auth.users

### 3. Start the Development Server

```bash
npm start
```

Or use:

```bash
npx http-server . -p 3000 -c-1
```

### 4. How It Works

The integration consists of three main files:

1. **config.js** - Loads environment variables from `.env.local`
2. **supabase-client.js** - Initializes the Supabase client and provides event fetching functions
3. **index.html** - Updated to use Supabase events instead of `events.json`

### Data Flow

1. On page load, `config.js` fetches and parses `.env.local`
2. `supabase-client.js` initializes the Supabase client with the loaded credentials
3. FullCalendar calls `window.fetchSupabaseEvents()` to load events from the database
4. Events are transformed from Supabase format to FullCalendar format:
   - `start_time` → `start`
   - `end_time` → `end`
   - `all_day` → `allDay`
   - Additional fields stored in `extendedProps`

### Fallback Behavior

If Supabase credentials are not configured or the connection fails, the app will automatically fall back to loading events from `events.json`. This ensures the app continues to work during development.

### Adding Events to Supabase

You can add events through:

1. **Supabase Dashboard** - Table Editor
2. **SQL** - Using the SQL editor
3. **API** - Using the Supabase client (future enhancement)

Example SQL insert:

```sql
INSERT INTO events (title, start_time, end_time, color, description)
VALUES (
  'Team Meeting',
  '2025-12-10 10:00:00+00',
  '2025-12-10 11:00:00+00',
  '#3b82f6',
  'Weekly team sync'
);
```

### Troubleshooting

1. **Check Browser Console** - The app logs detailed information about event loading
2. **Verify Credentials** - Make sure `.env.local` has correct Supabase URL and key
3. **Check CORS** - Supabase should allow requests from your domain
4. **Database Permissions** - Ensure Row Level Security (RLS) policies allow reading events

### Next Steps

Consider adding:
- Event creation UI
- Event editing/deletion
- Real-time updates using Supabase subscriptions
- User authentication
- RLS policies for multi-user support
