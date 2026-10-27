-- ==============================================================================
-- AICTE REGULATORY COMPLIANCE PLATFORM - SUPABASE REAL-TIME CONFIGURATION SCRIPT
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- after running the migration script or starting the backend.
-- ==============================================================================

-- 1. Enable Full Replica Identity for real-time row-level payloads
ALTER TABLE IF EXISTS public.applications REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.findings REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.documents REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.validation_runs REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.audit_events REPLICA IDENTITY FULL;

-- 2. Add tables to the 'supabase_realtime' publication
DO $$
BEGIN
    -- Check and add applications
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
    END IF;

    -- Check and add findings
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'findings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.findings;
    END IF;

    -- Check and add documents
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'documents'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
    END IF;

    -- Check and add audit_events
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'audit_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_events;
    END IF;

    -- Check and add validation_runs
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'validation_runs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.validation_runs;
    END IF;
END $$;

-- 3. Verify Publication Status
SELECT pubname, schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
ORDER BY tablename;
