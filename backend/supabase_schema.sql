-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE test_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE integration_type AS ENUM ('github', 'vercel', 'figma');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    github_username TEXT,
    vercel_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User integrations table
CREATE TABLE public.user_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    integration_type integration_type NOT NULL,
    access_token TEXT NOT NULL, -- Encrypted in production
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, integration_type)
);

-- Test requests table
CREATE TABLE public.test_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- SRS Document
    srs_document_url TEXT NOT NULL,
    srs_document_name TEXT NOT NULL,
    
    -- Target URL (for existing websites/Figma designs)
    target_url TEXT,
    
    -- Generated website details
    generated_website_url TEXT,
    github_repo_url TEXT,
    vercel_deployment_url TEXT,
    user_arguments TEXT, -- Arguments used for generation
    
    -- Test configuration
    test_types TEXT[] DEFAULT ARRAY['functional', 'uiux', 'accessibility', 'compatibility', 'performance'],
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test reports table
CREATE TABLE public.test_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.test_requests(id) ON DELETE CASCADE NOT NULL,
    
    -- Test execution details
    status test_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results (stored as JSON instead of separate files)
    report_data JSONB DEFAULT '{}',
    summary JSONB DEFAULT '{}', -- Summary statistics
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test execution logs table
CREATE TABLE public.test_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.test_reports(id) ON DELETE CASCADE NOT NULL,
    test_type TEXT NOT NULL,
    log_level TEXT DEFAULT 'info', -- info, warning, error
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_test_requests_user_id ON public.test_requests(user_id);
CREATE INDEX idx_test_requests_created_at ON public.test_requests(created_at DESC);
CREATE INDEX idx_test_reports_request_id ON public.test_reports(request_id);
CREATE INDEX idx_test_reports_status ON public.test_reports(status);
CREATE INDEX idx_test_execution_logs_report_id ON public.test_execution_logs(report_id);
CREATE INDEX idx_user_integrations_user_id ON public.user_integrations(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_execution_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User integrations policies
CREATE POLICY "Users can manage own integrations" ON public.user_integrations
    FOR ALL USING (auth.uid() = user_id);

-- Test requests policies
CREATE POLICY "Users can view own test requests" ON public.test_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own test requests" ON public.test_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test requests" ON public.test_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own test requests" ON public.test_requests
    FOR DELETE USING (auth.uid() = user_id);

-- Test reports policies
CREATE POLICY "Users can view own test reports" ON public.test_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_requests 
            WHERE id = request_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage test reports" ON public.test_reports
    FOR ALL USING (true); -- This should be restricted to service role in production

-- Test execution logs policies
CREATE POLICY "Users can view own test logs" ON public.test_execution_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_reports tr
            JOIN public.test_requests req ON tr.request_id = req.id
            WHERE tr.id = report_id AND req.user_id = auth.uid()
        )
    );

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_integrations_updated_at BEFORE UPDATE ON public.user_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_requests_updated_at BEFORE UPDATE ON public.test_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_reports_updated_at BEFORE UPDATE ON public.test_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optimized storage - only one bucket needed for SRS documents
-- Test reports are stored as JSONB in database, generated sites stored externally
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('srs-documents', 'srs-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Simplified storage policies - only for SRS documents
DROP POLICY IF EXISTS "Users can upload own SRS documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own SRS documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can download own test reports" ON storage.objects;

CREATE POLICY "Users can upload own SRS documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'srs-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own SRS documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'srs-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own SRS documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'srs-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
