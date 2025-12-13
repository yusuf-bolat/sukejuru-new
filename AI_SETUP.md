# AI Assistant Setup Guide

## Overview
The calendar application now includes an intelligent AI assistant powered by OpenAI's GPT-4 that can help you manage events, todos, and provide productivity counseling.

## What the AI Can Do

### 1. Event Management
- **Create one-time events**: "Add a meeting tomorrow from 5pm to 7pm"
- **Create recurring events**: "I have meetings every Tuesday for the next 4 weeks from 3pm to 6pm"
- **Update events**: "Change my meeting tomorrow to 6pm"
- **Delete events**: "Delete my meeting on December 10th"

### 2. Todo Management
- **Create todos**: "I need to do Notes by 11th Dec"
- **Add detailed todos**: "Add a work task to finish project report by Friday, high priority"
- **Delete todos**: "Remove the Notes task"

### 3. Counseling & Productivity
- Ask for productivity advice
- Get calendar organization tips
- Receive time management suggestions
- General conversation about your schedule

## Setup Instructions

### Step 1: Get an OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)

### Step 2: Add the API Key to Your Environment
1. Open or create the `.env.local` file in the project root
2. Add the following line:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

Your complete `.env.local` should look like:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### Step 3: Restart the Application
After adding the API key, refresh your browser page to load the new configuration.

## How to Use the AI Assistant

### Natural Language Examples

#### Creating Events
- "Add a dentist appointment tomorrow at 3pm"
- "Schedule a team meeting next Monday from 2pm to 4pm"
- "I have a presentation on December 15th at 10am lasting 2 hours"
- "Create recurring standup meetings every weekday at 9am for one month"

#### Creating Todos
- "Add a todo to buy groceries by Saturday"
- "I need to finish the report by end of day"
- "Remind me to call mom, high priority"
- "Add a work task: review code, 2 hours, due Friday"

#### Recurring Events
The AI understands complex recurrence patterns:
- "Every Tuesday" → Weekly on Tuesday
- "Every weekday" → Monday through Friday
- "First Monday of every month" → Monthly on first Monday
- "Every other week" → Bi-weekly

When you create recurring events, they are automatically grouped with a `series_id` so you can manage them as a group.

#### Asking Questions
- "What do I have scheduled for tomorrow?"
- "How can I be more productive?"
- "Am I overbooked this week?"
- "Give me tips for time blocking"

## Features

### Smart Date Parsing
The AI understands natural language dates:
- "tomorrow", "next week", "in 3 days"
- "Friday", "next Monday"
- "December 15th", "12/15/2025"

### Context Awareness
The AI knows:
- Current date and time
- Your calendar view (week/day/month)
- Your authentication status

### Confirmation Messages
After executing actions, you'll see:
- ✓ Event created successfully!
- ✓ Todo created successfully!
- ✗ Failed to complete action (with error details)

## Troubleshooting

### "OpenAI API key not configured"
- Make sure you added `OPENAI_API_KEY` to `.env.local`
- Refresh the page after adding the key

### "OpenAI API error: 401"
- Your API key is invalid or expired
- Generate a new key from OpenAI platform

### "OpenAI API error: 429"
- You've exceeded your API quota
- Check your OpenAI billing and usage limits

### AI doesn't understand my request
Try being more specific:
- Include times: "5pm" instead of "evening"
- Specify dates: "December 10th" instead of "soon"
- Provide duration: "2 hours" or "from 5pm to 7pm"

## Privacy & Security

- Your API key is stored locally in `.env.local` (never committed to git)
- Conversations are sent to OpenAI's servers for processing
- Event and todo data is stored in your Supabase database
- The AI only has access to create/modify YOUR events (based on authentication)

## Cost Considerations

- OpenAI charges per API call
- GPT-4o-mini is cost-effective (~$0.15 per 1M input tokens)
- Typical calendar request costs < $0.001
- Monitor usage at https://platform.openai.com/usage

## Advanced Usage

### Custom Event Properties
"Add a meeting at 5pm tomorrow at Conference Room A with a note that we need to review Q4 numbers"
→ Creates event with location and description

### Priority Todos
"Add a high priority work task to finish presentation by Friday"
→ Creates todo with priority level 3

### Color Coding
The AI automatically assigns colors to events and todos, but you can request specific ones:
"Add a personal event (use green) for dinner at 7pm"

## Technical Details

### Recurrence Rules
Recurring events use iCalendar RRULE format:
- `FREQ=WEEKLY;BYDAY=TU;COUNT=4` → Every Tuesday, 4 times
- `FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR` → Every weekday

### Series Management
Recurring events share a `series_id` (UUID) so you can:
- Update all events in a series
- Delete all events in a series
- Identify which events are related

## Example Conversation

**You**: "Hey, can you add a meeting tomorrow from 5pm to 7pm?"

**AI**: "I'll add that meeting for you!"
✓ Event created successfully!

**You**: "Actually, I have meetings every Tuesday for the next 4 weeks from 3pm to 6pm"

**AI**: "I'll schedule those recurring meetings for you!"
✓ Event created successfully!

**You**: "I need to finish my notes by December 11th"

**AI**: "I'll add that task for you!"
✓ Todo created successfully!

**You**: "How can I stay more organized?"

**AI**: "Here are some tips for staying organized with your calendar:
1. Time-block your important tasks
2. Use color coding for different event types
3. Review your week every Sunday evening
4. Leave buffer time between meetings
5. Use todos for tasks under 2 hours..."

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify all environment variables are set
3. Ensure you're authenticated with Supabase
4. Check your OpenAI API key is valid and has credits

Happy scheduling! 🎉
