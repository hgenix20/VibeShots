# Vibe Shots - AI-Powered TikTok Video Scheduler

## Setup Instructions

### 1. Environment Variables

**IMPORTANT**: You must update the `.env` file with your actual Supabase credentials before the application will work.

The `.env` file already exists but contains placeholder values. Update it with your actual Supabase project details:

```env
# Supabase Configuration (REQUIRED - Replace with your actual values)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings > API to find your project URL and anon key
3. **Replace the placeholder values** in your `.env` file with these actual values
4. The database schema will be automatically created when you run the migrations

### 3. Running the Application

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev:full
```

This will start:
- Frontend (Vite) on http://localhost:5173
- Backend (Express) on http://localhost:3001

### 4. Troubleshooting

If you see "Missing or invalid Supabase environment variables":
1. **The `.env` file exists but contains placeholder values**
2. Go to your Supabase dashboard: Settings > API
3. Copy your actual Project URL and anon key
4. Replace the placeholder values in `.env` with your actual values
5. Restart the servers after updating `.env`

If you see database errors:
1. Verify your Supabase project is active
2. Check that the URL and key are correct
3. Ensure the database migrations have run

If you see "ECONNREFUSED" errors:
1. This means the backend server failed to start
2. Check the terminal for Supabase configuration errors
3. Follow the setup instructions above

### 5. Current Status

- ✅ Supabase integration
- ✅ Basic CRUD operations for ideas
- ✅ RLS temporarily disabled for testing
- ⏳ User authentication (coming next)
- ⏳ TikTok API integration
- ⏳ AI script generation