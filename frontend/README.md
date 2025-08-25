# FigmaGuard - Automated Testing Platform

<div align="center">
  <a href="https://imgbb.com/"><img src="https://i.ibb.co/ns7cyWQL/Screenshot-2025-08-25-234055.png" alt="Screenshot-2025-08-25-234055" border="0"></a>
  
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
- Uses Groq LLM for code generation
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
- **Next.js** - React framework with App Router
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
- Vercel Personal Access Token

## 🚀 Quick Start

### 1. Clone Repository

```
git clone https://github.com/P1Manav/FigmaGuard.git
cd figmaguard
```
### 2. Frontend Setup

# Install dependencies
```
yarn install
```

# Create environment file
```
.env.local 
```

# Add your Supabase credentials
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Backend Setup

# Navigate to backend
```
cd backend
```

# Create virtual environment
```
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

# Install dependencies
```
pip install -r requirements.txt
```

# Install Playwright browsers
```
playwright install
```

# Create environment file
```
.env
```

# Add your credentials
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
FLASK_ENV=development
FLASK_DEBUG=True
RENDER_URL=http://localhost:5000/  #optional for deployment on render
```

### 4. Database Setup

1. Create a Supabase project
2. Run the SQL schema from `backend/supabase_schema.sql`
3. Set up Google OAuth in Supabase Auth settings
4. Create storage buckets: `srs-documents`, `test-reports`, `generated-sites`

### 5. Run the Application

# Terminal 1: Backend
```
cd backend
python server.py
```

# Terminal 2: Frontend
```
npm run dev
```

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


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Getting Help

- Check the [Issues](https://github.com/your-username/figmaguard/issues) page
- Review the console logs for error details
- Ensure all environment variables are properly set

## 👨‍💻 Author

**Your Name**
- LinkedIn: [Prajapati Manav](https://www.linkedin.com/in/manavdprajapati/)
- Email: [maxprajapati606@gmail.com](mailto:maxprajapati606@gmail.com)
- GitHub: [P1Manav](https://github.com/P1manav)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">
  <p>Built with ❤️ using Next.js, Python, and AI</p>
  <p>© 2025 FigmaGuard. All rights reserved.</p>
</div>
