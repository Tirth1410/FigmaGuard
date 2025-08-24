# Complete Setup Guide for FigmaGuard

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- Git
- Supabase account
- Google account (for OAuth)
- Groq API Key (for AI code generation)
- GitHub Personal Access Token (PAT) (for creating repositories)
- Vercel API Token (for deploying to Vercel)

## Step 1: Clone and Setup Project

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd figmaguard

# Install frontend dependencies
npm install

# Setup backend
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install
\`\`\`

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created

### 2.2 Get API Keys

1. Go to Settings > API
2. Copy your project URL and anon key
3. Copy your service role key (for backend)

### 2.3 Setup Database

1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the entire content from `backend/supabase_schema.sql`
3. Click "Run" to execute the schema

### 2.4 Setup Authentication

1. Go to Authentication > Settings
2. Click "Add Provider" and select Google
3. Enter your Google OAuth credentials:
   - Client ID: Get from Google Cloud Console
   - Client Secret: Get from Google Cloud Console
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 2.5 Setup Storage

1. Go to Storage
2. Create these buckets:
   - `srs-documents` (private)
   - `test-reports` (private)
   - `generated-sites` (public)

## Step 3: Google OAuth Setup

### 3.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API

### 3.2 Create OAuth Credentials

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

## Step 4: Generate API Tokens

### 4.1 Get Groq API Key

1. Go to [groq.com](https://groq.com)
2. Sign up/Log in
3. Navigate to API Keys and create a new API key.

### 4.2 Generate GitHub Personal Access Token (PAT)

1. Go to GitHub: Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "FigmaGuard-Deployment")
4. Grant `repo` scope (full control of private repositories)
5. Copy the generated token (it will only be shown once!)

### 4.3 Generate Vercel API Token

1. Go to Vercel: Settings > Tokens
2. Click "Create"
3. Give it a descriptive name (e.g., "FigmaGuard-Deployment")
4. Copy the generated token (it will only be shown once!)

## Step 5: Environment Variables

### 5.1 Frontend Environment (.env.local)

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 5.2 Backend Environment (backend/.env)

\`\`\`env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key
FLASK_ENV=development
FLASK_DEBUG=True
GROQ_API_KEY=your-groq-api-key # Add your Groq API Key here
\`\`\`

## Step 6: Run the Application

### 6.1 Start Backend Server

\`\`\`bash
cd backend
# Make sure virtual environment is activated
python server.py
\`\`\`

The backend will start on `http://localhost:5000`

### 6.2 Start Frontend Server

\`\`\`bash
# In a new terminal, from project root
npm run dev
\`\`\`

The frontend will start on `http://localhost:3000`

## Step 7: Test the Application

1. Open `http://localhost:3000`
2. Click "Sign In" and authenticate with Google
3. Upload an SRS document (PDF or DOCX)
4. Choose to test existing URL or generate website
5. Select your desired test types
6. If generating, provide GitHub and Vercel tokens.
7. View results in dashboard

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify environment variables are correct
   - Check if Supabase project is active
   - Ensure service role key has proper permissions

2. **Authentication Issues**
   - Verify Google OAuth credentials
   - Check redirect URLs match exactly
   - Ensure Google+ API is enabled

3. **Playwright Issues**
   - Run `playwright install` to install browsers
   - On Linux, may need additional dependencies: `playwright install-deps`

4. **Python Import Errors**
   - Ensure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt`

5. **AI Generation Issues (Groq)**
   - Ensure `GROQ_API_KEY` is correctly set in `backend/.env`.
   - Check Groq API usage limits or rate limits.
   - Review the backend console for errors from `llm_client.py`.

6. **GitHub/Vercel Integration Issues**
   - Ensure `github_token` and `vercel_token` are correctly provided in the frontend form.
   - Verify the tokens have the necessary permissions (GitHub `repo` scope, Vercel full access).
   - Check the backend console for specific API errors from GitHub or Vercel.

### Database Issues

If you encounter foreign key constraint errors:

1. Check if the user exists in auth.users table
2. Verify RLS policies are correctly set
3. Use the correct user_id from authenticated session

### Storage Issues

If file uploads fail:

1. Verify storage buckets exist
2. Check RLS policies on storage.objects
3. Ensure proper file permissions

## Production Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Backend (Railway/Heroku)

1. Create `Procfile`:
   \`\`\`
   web: python server.py
   \`\`\`
2. Add environment variables
3. Deploy

### Update Supabase Settings

1. Add production URLs to OAuth redirect URLs
2. Update CORS settings if needed
3. Review RLS policies for production

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check Supabase logs for database issues

For additional help, create an issue in the repository.
