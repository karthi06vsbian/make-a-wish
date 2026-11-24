-- ====================================================================
-- MAKE A WISH • Complete Supabase Schema & Security Migration
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing tables if re-running
DROP TABLE IF EXISTS community_blessings CASCADE;
DROP TABLE IF EXISTS wish_days CASCADE;
DROP TABLE IF EXISTS voice_notes CASCADE;
DROP TABLE IF EXISTS wishes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES (for Admin and Staff)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ADMIN ROLES
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin', 'moderator')),
    granted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PAYMENTS (Locked down, written by server-side Edge Functions)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_order_id TEXT NOT NULL UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL DEFAULT 1000, -- ₹10 in paise
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'captured', 'failed', 'refunded')),
    idempotency_key TEXT UNIQUE,
    customer_email TEXT,
    customer_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payments_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- 4. WISHES (Sacred User Intentions)
CREATE TABLE wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    access_pin TEXT NOT NULL, -- 4 or 6 digit PIN to access journey privately
    wish_type TEXT NOT NULL CHECK (wish_type IN ('text', 'voice', 'both')),
    text_content TEXT,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('peace', 'health', 'family', 'growth', 'relationship', 'inner_strength', 'gratitude', 'general')),
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ta', 'hi', 'te', 'ml', 'kn')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('approved', 'rejected', 'pending')),
    payment_id UUID NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,
    blessings_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_wishes_reference_id ON wishes(reference_id);
CREATE INDEX idx_wishes_payment_id ON wishes(payment_id);
CREATE INDEX idx_wishes_public_approved ON wishes(is_public, moderation_status) WHERE is_public = true AND moderation_status = 'approved';
CREATE INDEX idx_wishes_created_at ON wishes(created_at DESC);

-- 5. VOICE NOTES (Stored securely in private Supabase Storage)
CREATE TABLE voice_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wish_id UUID NOT NULL UNIQUE REFERENCES wishes(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 180),
    mime_type TEXT NOT NULL DEFAULT 'audio/webm',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_voice_notes_wish_id ON voice_notes(wish_id);

-- 6. WISH DAYS (The Seven-Day Positive Reflection Journey)
CREATE TABLE wish_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wish_id UUID NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
    title TEXT NOT NULL,
    theme TEXT NOT NULL,
    reflection_message TEXT NOT NULL,
    affirmation TEXT NOT NULL,
    mindful_action TEXT NOT NULL,
    is_unlocked BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_wish_day UNIQUE (wish_id, day_number)
);

CREATE INDEX idx_wish_days_lookup ON wish_days(wish_id, day_number);

-- 7. COMMUNITY BLESSINGS (Visitors lighting virtual diyas for approved wishes)
CREATE TABLE community_blessings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wish_id UUID NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
    blessed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_ip_hash TEXT
);

CREATE INDEX idx_blessings_wish_id ON community_blessings(wish_id);

-- ====================================================================
-- STORED PROCEDURES & TRIGGERS
-- ====================================================================

-- Function to initialize the 7 days reflection journey for a newly created wish
CREATE OR REPLACE FUNCTION public.initialize_wish_journey()
RETURNS TRIGGER AS $$
DECLARE
    w_lang TEXT := NEW.language;
BEGIN
    -- Day 1 is unlocked immediately
    INSERT INTO public.wish_days (wish_id, day_number, title, theme, reflection_message, affirmation, mindful_action, is_unlocked, unlocked_at)
    VALUES 
    (
        NEW.id, 
        1, 
        'Your Sacred Wish Has Been Received', 
        'Arrival & Peace',
        'Your intention has been planted like a seed in fertile soil. Breathe deeply, unclench your shoulders, and know that naming what your heart yearns for is the first act of courage.',
        'I release anxiety and allow my heart to rest in peaceful trust.',
        'Sit silently for 2 minutes today with closed eyes. Place your hand on your heart and breathe.',
        true,
        now()
    ),
    (
        NEW.id, 
        2, 
        'Cultivate Still Hope', 
        'Patience & Faith',
        'Hope is not demanding immediate miracles; it is the quiet lamp burning gently in the dark. Let your hope be soft, resilient, and unhurried today.',
        'I welcome patience. Every meaningful journey unfolds one moment at a time.',
        'Drink a glass of water mindfully. With each sip, silently whisper thank you to your body.',
        false,
        NULL
    ),
    (
        NEW.id, 
        3, 
        'Believe In Your Inner Strength', 
        'Inner Resilience',
        'Reflect on how much you have already survived and learned. The universe does not work on passive wishing alone, but on the quiet strength awakening within you.',
        'I carry within me the wisdom, courage, and perseverance needed for my path.',
        'Write down one past struggle that you conquered. Acknowledge your courage.',
        false,
        NULL
    ),
    (
        NEW.id, 
        4, 
        'One Small Mindful Step', 
        'Aligned Action',
        'Wishes are dreams anchored by gentle, conscious deeds. What is one small, kind action you can take today that aligns with your wish?',
        'My purposeful small actions create ripples of positive change.',
        'Do one tangible act today toward your peace or goal, no matter how tiny.',
        false,
        NULL
    ),
    (
        NEW.id, 
        5, 
        'Practice Deep Gratitude', 
        'Abundance & Grace',
        'Gratitude opens the heart to recognize the goodness already present. When we appreciate the small blessings, life feels warmer and more generous.',
        'I am deeply grateful for the blessings of this day, visible and invisible.',
        'Express genuine gratitude to someone who supported you, or write 3 blessings you have.',
        false,
        NULL
    ),
    (
        NEW.id, 
        6, 
        'Keep Going With Grace', 
        'Perseverance & Trust',
        'Doubt may visit, but doubt is merely a cloud passing across the sun. Return to your breathing. Keep walking with gentle determination.',
        'I do not rush, nor do I give up. I walk forward with quiet dignity.',
        'Go for a 10-minute quiet walk without looking at your phone. Observe the sky and trees.',
        false,
        NULL
    ),
    (
        NEW.id, 
        7, 
        'A Serene New Beginning', 
        'Completion & Renewal',
        'Your seven-day journey marks not an ending, but a renewed, clearer state of mind. You have honored your heart with patience, reflection, and mindful intention.',
        'I step forward into each day with a peaceful mind, an open heart, and renewed hope.',
        'Light a candle or diya, or pause in quiet contemplation to mark your renewed journey.',
        false,
        NULL
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_initialize_wish_journey
AFTER INSERT ON wishes
FOR EACH ROW
EXECUTE FUNCTION public.initialize_wish_journey();

-- Function to light a virtual diya and increment blessing count atomically
CREATE OR REPLACE FUNCTION public.light_diya(p_wish_id UUID, p_client_hash TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    -- Insert blessing record
    INSERT INTO public.community_blessings (wish_id, client_ip_hash)
    VALUES (p_wish_id, p_client_hash);

    -- Increment count
    UPDATE public.wishes
    SET blessings_count = blessings_count + 1
    WHERE id = p_wish_id
    RETURNING blessings_count INTO new_count;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for secure retrieval of user wish journey via Reference ID & PIN
CREATE OR REPLACE FUNCTION public.get_wish_journey(p_reference_id TEXT, p_access_pin TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'wish', jsonb_build_object(
            'id', w.id,
            'reference_id', w.reference_id,
            'wish_type', w.wish_type,
            'text_content', w.text_content,
            'category', w.category,
            'language', w.language,
            'is_public', w.is_public,
            'blessings_count', w.blessings_count,
            'created_at', w.created_at
        ),
        'days', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'day_number', d.day_number,
                    'title', d.title,
                    'theme', d.theme,
                    'reflection_message', d.reflection_message,
                    'affirmation', d.affirmation,
                    'mindful_action', d.mindful_action,
                    'is_unlocked', d.is_unlocked,
                    'unlocked_at', d.unlocked_at
                ) ORDER BY d.day_number ASC
            )
            FROM public.wish_days d
            WHERE d.wish_id = w.id
        ),
        'has_voice_note', EXISTS (SELECT 1 FROM public.voice_notes vn WHERE vn.wish_id = w.id)
    ) INTO result
    FROM public.wishes w
    WHERE w.reference_id = p_reference_id
    AND w.access_pin = p_access_pin;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_blessings ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read own profile; admins can read all
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Admin Roles: only admins can view admin assignments
CREATE POLICY "Admins can view admin roles" ON admin_roles
    FOR SELECT TO authenticated
    USING (public.is_admin() OR auth.uid() = user_id);

-- Payments: Only service_role can INSERT/UPDATE. Admins can SELECT.
CREATE POLICY "Admins can view payments" ON payments
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Wishes:
-- 1. Public can view APPROVED public wishes (limited fields handled by view/query)
CREATE POLICY "Public can view approved public wishes" ON wishes
    FOR SELECT TO anon, authenticated
    USING (is_public = true AND moderation_status = 'approved');

-- 2. Admins can view and moderate ALL wishes
CREATE POLICY "Admins have full access to wishes" ON wishes
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Voice Notes:
-- Never readable by anonymous users directly. Admins can view.
CREATE POLICY "Admins can view voice notes" ON voice_notes
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Wish Days:
-- Admins can view all days. Public lookup is restricted through get_wish_journey RPC
CREATE POLICY "Admins can view all wish days" ON wish_days
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Community Blessings:
CREATE POLICY "Public can view blessings" ON community_blessings
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public can add blessings via function" ON community_blessings
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- ====================================================================
-- STORAGE BUCKET CONFIGURATION (for Supabase Storage)
-- ====================================================================

-- Insert private bucket for voice notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wish-voice-notes',
    'wish-voice-notes',
    false, -- STRICTLY PRIVATE
    15728640, -- 15MB limit
    ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 15728640,
    allowed_mime_types = ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac'];

-- Storage RLS:
-- Only service_role can upload/download directly, admins can download.
CREATE POLICY "Admins can read voice notes storage" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'wish-voice-notes' AND public.is_admin());

CREATE POLICY "Admins can delete voice notes storage" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'wish-voice-notes' AND public.is_admin());
