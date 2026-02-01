-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'CLP',
    timezone TEXT DEFAULT 'America/Santiago',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create movements table
CREATE TABLE IF NOT EXISTS public.movements (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gasto', 'ingreso')),
    category TEXT NOT NULL,
    merchant TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL CHECK (source IN ('gmail', 'manual')),
    email_id TEXT,
    confidence_score NUMERIC(3, 2) DEFAULT 0,
    raw_extract TEXT,
    status TEXT NOT NULL CHECK (status IN ('pendiente_confirmacion', 'confirmado', 'descartado')),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('mensual', 'anual')),
    next_billing_date DATE NOT NULL,
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    reminders_enabled BOOLEAN DEFAULT false,
    movement_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create rules table
CREATE TABLE IF NOT EXISTS public.rules (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    condition_field TEXT NOT NULL CHECK (condition_field IN ('subject', 'from', 'body')),
    condition_operator TEXT NOT NULL CHECK (condition_operator IN ('contains', 'equals')),
    condition_value TEXT NOT NULL,
    action_category TEXT,
    action_type TEXT CHECK (action_type IN ('gasto', 'ingreso')),
    action_status TEXT CHECK (action_status IN ('pendiente_confirmacion', 'confirmado', 'descartado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sync_state table
CREATE TABLE IF NOT EXISTS public.sync_state (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    last_processed_email_id TEXT,
    last_sync_timestamp TIMESTAMP WITH TIME ZONE,
    total_processed_count INTEGER DEFAULT 0,
    ignored_subscriptions TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_movements_user_id ON public.movements(user_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON public.movements(date DESC);
CREATE INDEX IF NOT EXISTS idx_movements_status ON public.movements(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON public.rules(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for movements table
CREATE POLICY "Users can view own movements" ON public.movements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movements" ON public.movements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movements" ON public.movements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movements" ON public.movements
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rules table
CREATE POLICY "Users can view own rules" ON public.rules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules" ON public.rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules" ON public.rules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules" ON public.rules
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sync_state table
CREATE POLICY "Users can view own sync state" ON public.sync_state
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync state" ON public.sync_state
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync state" ON public.sync_state
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_movements
    BEFORE UPDATE ON public.movements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_rules
    BEFORE UPDATE ON public.rules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_sync_state
    BEFORE UPDATE ON public.sync_state
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, currency, timezone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'currency', 'CLP'),
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'America/Santiago')
    );
    
    INSERT INTO public.sync_state (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
