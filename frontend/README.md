# FigmaGuard - Automated Testing Platform

<div align="center">
  <img src="/placeholder.svg?height=120&width=120" alt="FigmaGuard Logo" width="120" height="120">
  
  **Automated testing platform for validating designs and web applications against Software Requirements Specification (SRS) documents.**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)](https://python.org/)
  [![Playwright](https://img.shields.io/badge/Playwright-Latest-green?style=flat-square&logo=playwright)](https://playwright.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
</div>

## 🚀 Features

### 🔐 **Authentication & User Management**
- Google OAuth integration via Supabase
- Secure user sessions and profile management
- Personal dashboard for tracking tests

### 📄 **Document Processing**
- Upload SRS documents (PDF, DOCX)
- AI-powered content extraction and analysis
- Secure cloud storage with Supabase

### 🌐 **Dual Testing Modes**
1. **Test Existing URLs** - Validate Figma designs or live websites
2. **Generate & Test** - AI creates websites from SRS requirements, deploys to Vercel, then tests

### 🤖 **AI-Powered Website Generation**
- Uses Groq LLM (Llama 3) for code generation
- Creates responsive HTML/CSS/JavaScript websites
- Automatic GitHub repository creation
- One-click Vercel deployment

### 🧪 **Comprehensive Testing Suite**
- **Functional Testing** - Core functionality validation
- **UI/UX Testing** - Design consistency and responsiveness
- **Accessibility Testing** - WCAG compliance and screen reader support
- **Compatibility Testing** - Cross-browser testing (Chrome, Firefox, Safari)
- **Performance Testing** - Load times and performance metrics

### 📊 **Advanced Reporting**
- Interactive test results dashboard
- Detailed test breakdowns by category
- Downloadable JSON reports
- Real-time test status updates

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Supabase Auth** - Authentication system

### Backend
- **Python Flask** - REST API server
- **Playwright** - Browser automation
- **Supabase** - Database and storage
- **PostgreSQL** - Relational database

### AI & Integrations
- **Groq API** - LLM for code generation
- **GitHub API** - Repository management
- **Vercel API** - Website deployment
- **Google OAuth** - User authentication

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- Supabase account
- Google OAuth credentials
- Groq API key
- GitHub Personal Access Token
- Vercel API token

## 🚀 Quick Start

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/your-username/figmaguard.git
cd figmaguard
\`\`\`

### 2. Frontend Setup

\`\`\`bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Backend Setup

\`\`\`bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install

# Create environment file
cp .env.example .env

# Add your credentials
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
\`\`\`

### 4. Database Setup

1. Create a Supabase project
2. Run the SQL schema from `backend/supabase_schema.sql`
3. Set up Google OAuth in Supabase Auth settings
4. Create storage buckets: `srs-documents`, `test-reports`, `generated-sites`

### 5. Run the Application

\`\`\`bash
# Terminal 1: Backend
cd backend
python server.py

# Terminal 2: Frontend
npm run dev
\`\`\`

Visit `http://localhost:3000` 🎉

## 📖 Usage Guide

### Testing Existing URLs

1. **Sign in** with your Google account
2. **Upload** your SRS document (PDF/DOCX)
3. **Enter** the Figma design or website URL
4. **Select** test types to run
5. **Click** "Run Test" and wait for results
6. **View** detailed results in your dashboard

### Generating & Testing Websites

1. **Sign in** and upload your SRS document
2. **Choose** "Generate Website from SRS"
3. **Provide** generation arguments (e.g., "Create a modern blog with dark theme")
4. **Enter** your GitHub and Vercel API tokens
5. **Select** test types and click "Generate & Test Website"
6. **Monitor** progress as the system:
   - Generates HTML/CSS/JS code using AI
   - Creates a GitHub repository
   - Deploys to Vercel
   - Runs comprehensive tests
7. **Review** results and access your live website

## 🔧 API Endpoints

### Authentication Required
All endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Core Endpoints

#### `POST /api/test`
Test an existing URL against SRS requirements.

**Request:**
\`\`\`json
{
  "srs_document": "file",
  "target_url": "https://example.com",
  "test_types[]": ["functional", "accessibility"]
}
\`\`\`

#### `POST /api/generate-and-test`
Generate website from SRS and test it.

**Request:**
\`\`\`json
{
  "srs_document": "file",
  "user_arguments": "Create a modern portfolio site",
  "github_token": "ghp_...",
  "vercel_token": "...",
  "test_types[]": ["functional", "uiux", "performance"]
}
\`\`\`

#### `GET /api/test-results/{test_run_id}`
Retrieve test results for a specific test run.

#### `GET /api/user/test-requests`
Get all test requests for the authenticated user.

## 🧪 Testing Types Explained

### 1. Functional Testing
- Form validation and submission
- Navigation functionality
- Interactive elements
- Core user workflows

### 2. UI/UX Testing
- Responsive design validation
- Typography consistency
- Visual element placement
- Mobile compatibility

### 3. Accessibility Testing
- Alt text for images
- Heading hierarchy
- Form label associations
- Color contrast ratios
- Keyboard navigation

### 4. Compatibility Testing
- Cross-browser functionality
- Basic loading across Chrome, Firefox, Safari
- JavaScript execution consistency

### 5. Performance Testing
- Page load times
- First Contentful Paint (FCP)
- Network request optimization
- Resource loading efficiency

## 🗄️ Database Schema

The application uses PostgreSQL via Supabase with the following main tables:

- `user_profiles` - Extended user information
- `user_integrations` - API tokens and integrations
- `test_requests` - Test execution requests
- `test_reports` - Test results and status
- `test_execution_logs` - Detailed test logs

See `backend/supabase_schema.sql` for the complete schema.

## 🔒 Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### Backend (.env)
\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
FLASK_ENV=development
\`\`\`

## 🚀 Deployment

### Frontend (Vercel)
\`\`\`bash
npm run build
vercel --prod
\`\`\`

### Backend (Railway/Heroku)
\`\`\`bash
echo "web: python server.py" > Procfile
# Deploy to your preferred platform
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**
- Verify Google OAuth setup in Supabase
- Check redirect URLs match exactly
- Ensure environment variables are correct

**Test Execution Failures**
- Run \`playwright install\` to install browsers
- Check if target URL is accessible
- Verify Python dependencies are installed

**Deployment Issues**
- Ensure GitHub token has \`repo\` scope
- Verify Vercel token has deployment permissions
- Check API rate limits

### Getting Help

- Check the [Issues](https://github.com/your-username/figmaguard/issues) page
- Review the console logs for error details
- Ensure all environment variables are properly set

## 🗺️ Roadmap

- [ ] Visual regression testing with screenshot comparison
- [ ] Custom test case creation interface
- [ ] Team collaboration features
- [ ] CI/CD pipeline integration
- [ ] Advanced AI models integration
- [ ] Real-time collaborative testing
- [ ] Performance benchmarking
- [ ] Custom reporting templates

## 👨‍💻 Author

**Your Name**
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)
- Email: [your-email@example.com](mailto:your-email@example.com)
- GitHub: [Your GitHub Profile](https://github.com/your-username)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">
  <p>Built with ❤️ using Next.js, Python, and AI</p>
  <p>© 2025 FigmaGuard. All rights reserved.</p>
</div>
