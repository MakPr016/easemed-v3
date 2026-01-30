-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('hospital', 'vendor', 'admin', 'cfo', 'cpo');
CREATE TYPE rfq_status AS ENUM ('draft', 'published', 'closed', 'awarded', 'rejected');
CREATE TYPE quotation_status AS ENUM ('pending', 'under_review', 'awarded', 'rejected');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    organization_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    hospital_type TEXT,
    bed_capacity INTEGER,
    license_number TEXT,
    accreditation TEXT,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    company_registration TEXT UNIQUE,
    gst_number TEXT,
    vendor_type TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    bank_name TEXT,
    bank_account TEXT,
    bank_ifsc TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQs table
CREATE TABLE public.rfqs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    hospital_id UUID REFERENCES public.hospitals(id),
    created_by UUID REFERENCES public.profiles(id),
    status rfq_status DEFAULT 'draft',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_deadline TIMESTAMP WITH TIME ZONE,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    document_url TEXT,
    terms_and_conditions TEXT,
    special_instructions TEXT,
    is_approved_by_cpo BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQ Items table
CREATE TABLE public.rfq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id TEXT REFERENCES public.rfqs(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    specification TEXT,
    estimated_price DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotations table
CREATE TABLE public.quotations (
    id TEXT PRIMARY KEY,
    rfq_id TEXT REFERENCES public.rfqs(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    delivery_time_days INTEGER NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status quotation_status DEFAULT 'pending',
    notes TEXT,
    terms TEXT,
    document_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotation Items table
CREATE TABLE public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id TEXT REFERENCES public.quotations(id) ON DELETE CASCADE,
    rfq_item_id UUID REFERENCES public.rfq_items(id),
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    brand TEXT,
    manufacturer TEXT,
    specifications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders table
CREATE TABLE public.purchase_orders (
    id TEXT PRIMARY KEY,
    rfq_id TEXT REFERENCES public.rfqs(id),
    quotation_id TEXT REFERENCES public.quotations(id),
    hospital_id UUID REFERENCES public.hospitals(id),
    vendor_id UUID REFERENCES public.vendors(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(12, 2) NOT NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_terms TEXT,
    delivery_address TEXT,
    special_instructions TEXT,
    created_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id TEXT,
    reference_type TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_hospitals_user_id ON public.hospitals(user_id);
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_rfqs_hospital_id ON public.rfqs(hospital_id);
CREATE INDEX idx_rfqs_status ON public.rfqs(status);
CREATE INDEX idx_rfqs_created_by ON public.rfqs(created_by);
CREATE INDEX idx_quotations_rfq_id ON public.quotations(rfq_id);
CREATE INDEX idx_quotations_vendor_id ON public.quotations(vendor_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_purchase_orders_hospital_id ON public.purchase_orders(hospital_id);
CREATE INDEX idx_purchase_orders_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for hospitals
CREATE POLICY "Hospitals can view own data" ON public.hospitals
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Hospitals can update own data" ON public.hospitals
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for vendors
CREATE POLICY "Vendors can view own data" ON public.vendors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Vendors can update own data" ON public.vendors
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for RFQs
CREATE POLICY "Hospitals can view own RFQs" ON public.rfqs
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Vendors can view published RFQs" ON public.rfqs
    FOR SELECT USING (status = 'published');

CREATE POLICY "Hospitals can create RFQs" ON public.rfqs
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Hospitals can update own RFQs" ON public.rfqs
    FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for quotations
CREATE POLICY "Vendors can view own quotations" ON public.quotations
    FOR SELECT USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

CREATE POLICY "Hospitals can view quotations for own RFQs" ON public.quotations
    FOR SELECT USING (
        rfq_id IN (SELECT id FROM public.rfqs WHERE created_by = auth.uid())
    );

CREATE POLICY "Vendors can create quotations" ON public.quotations
    FOR INSERT WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON public.rfqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- STEP 1: DISABLE RLS TEMPORARILY
-- ============================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: DELETE ALL DATA (CASCADE)
-- ============================================
DELETE FROM public.notifications;
DELETE FROM public.order_items;
DELETE FROM public.purchase_orders;
DELETE FROM public.quotation_items;
DELETE FROM public.quotations;
DELETE FROM public.rfq_items;
DELETE FROM public.rfqs;
DELETE FROM public.vendors;
DELETE FROM public.hospitals;
DELETE FROM public.profiles;

-- Delete auth identities first
DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN (
        'hospital@example.com',
        'cityhospital@example.com',
        'vendor1@example.com',
        'vendor2@example.com',
        'vendor3@example.com',
        'cpo@example.com'
    )
);

-- Delete auth users
DELETE FROM auth.users WHERE email IN (
    'hospital@example.com',
    'cityhospital@example.com',
    'vendor1@example.com',
    'vendor2@example.com',
    'vendor3@example.com',
    'cpo@example.com'
);

-- ============================================
-- STEP 3: RE-ENABLE RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.create_user(
    user_id uuid,
    email text,
    password text,
    user_role text
) RETURNS void AS $$
DECLARE
    encrypted_pw text;
BEGIN
    encrypted_pw := crypt(password, gen_salt('bf'));

    INSERT INTO auth.users
        (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES
        ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, NOW(), NOW(), NOW(), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), jsonb_build_object('role', user_role), NOW(), NOW(), '', '', '', '');

    INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES
        (gen_random_uuid(), user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', NOW(), NOW(), NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: CREATE HOSPITAL USERS (EUROPE)
-- ============================================
SELECT public.create_user('11111111-1111-1111-1111-111111111111', 'hospital.paris@example.com', 'Hospital@123', 'hospital');
SELECT public.create_user('22222222-2222-2222-2222-222222222222', 'hospital.berlin@example.com', 'Hospital@123', 'hospital');

-- Insert hospital profiles
INSERT INTO public.profiles (id, email, full_name, role, organization_name, phone, address, city, state, country, postal_code, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'hospital.paris@example.com', 'Hôpital Saint-Louis', 'hospital', 'Hôpital Saint-Louis', '+33 1 42 49 49 49', '1 Avenue Claude Vellefaux', 'Paris', 'Île-de-France', 'France', '75010', true),
    ('22222222-2222-2222-2222-222222222222', 'hospital.berlin@example.com', 'Charité Universitätsmedizin', 'hospital', 'Charité Universitätsmedizin Berlin', '+49 30 450 50', 'Charitéplatz 1', 'Berlin', 'Berlin', 'Germany', '10117', true);

-- Insert hospital details
INSERT INTO public.hospitals (id, user_id, hospital_name, registration_number, hospital_type, bed_capacity, contact_person, contact_email, contact_phone, address, city, state, postal_code, latitude, longitude, is_verified)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Hôpital Saint-Louis', 'HOS-FR-2024-001', 'Teaching Hospital', 650, 'Dr. Marie Dupont', 'hospital.paris@example.com', '+33 1 42 49 49 49', '1 Avenue Claude Vellefaux', 'Paris', 'Île-de-France', '75010', 48.8716, 2.3701, true),
    ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Charité Universitätsmedizin', 'HOS-DE-2024-002', 'University Hospital', 3000, 'Dr. Klaus Müller', 'hospital.berlin@example.com', '+49 30 450 50', 'Charitéplatz 1', 'Berlin', 'Berlin', '10117', 52.5251, 13.3768, true);

-- ============================================
-- STEP 6: CREATE VENDOR USERS (EUROPE)
-- ============================================
SELECT public.create_user('33333333-3333-3333-3333-333333333333', 'vendor.amsterdam@example.com', 'Vendor@123', 'vendor');
SELECT public.create_user('44444444-4444-4444-4444-444444444444', 'vendor.madrid@example.com', 'Vendor@123', 'vendor');
SELECT public.create_user('55555555-5555-5555-5555-555555555555', 'vendor.rome@example.com', 'Vendor@123', 'vendor');

-- Insert vendor profiles
INSERT INTO public.profiles (id, email, full_name, role, organization_name, phone, address, city, state, country, postal_code, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 'vendor.amsterdam@example.com', 'MedSupply Europe BV', 'vendor', 'MedSupply Europe BV', '+31 20 123 4567', 'Prins Hendrikkade 21', 'Amsterdam', 'North Holland', 'Netherlands', '1012 TM', true),
    ('44444444-4444-4444-4444-444444444444', 'vendor.madrid@example.com', 'Iberia Medical Solutions SL', 'vendor', 'Iberia Medical Solutions SL', '+34 91 123 4567', 'Calle de Alcalá 123', 'Madrid', 'Community of Madrid', 'Spain', '28009', true),
    ('55555555-5555-5555-5555-555555555555', 'vendor.rome@example.com', 'Medica Italia SpA', 'vendor', 'Medica Italia SpA', '+39 06 123 4567', 'Via Nazionale 194', 'Rome', 'Lazio', 'Italy', '00184', true);

-- Insert vendor details
INSERT INTO public.vendors (id, user_id, vendor_name, company_registration, gst_number, vendor_type, rating, total_orders, completed_orders, contact_person, contact_email, contact_phone, address, city, state, postal_code, bank_name, bank_account, bank_ifsc, is_verified)
VALUES 
    ('b3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'MedSupply Europe BV', 'NL-REG-2024-001', 'NL123456789B01', 'Medical Equipment & Supplies', 4.7, 145, 132, 'Jan van der Berg', 'vendor.amsterdam@example.com', '+31 20 123 4567', 'Prins Hendrikkade 21', 'Amsterdam', 'North Holland', '1012 TM', 'ING Bank', 'NL91INGB0001234567', 'INGBNL2A', true),
    ('b4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Iberia Medical Solutions SL', 'ES-REG-2024-002', 'ESB12345678', 'Medical Supplies & Pharmaceuticals', 4.5, 98, 89, 'Carmen García López', 'vendor.madrid@example.com', '+34 91 123 4567', 'Calle de Alcalá 123', 'Madrid', 'Community of Madrid', '28009', 'Banco Santander', 'ES9121000418450200051332', 'BSCHESMM', true),
    ('b5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Medica Italia SpA', 'IT-REG-2024-003', 'IT12345678901', 'Medical Devices & Equipment', 4.3, 76, 68, 'Marco Rossi', 'vendor.rome@example.com', '+39 06 123 4567', 'Via Nazionale 194', 'Rome', 'Lazio', '00184', 'Intesa Sanpaolo', 'IT60X0542811101000000123456', 'BCITITMM', true);

-- ============================================
-- STEP 7: CREATE ADMIN/CPO USER
-- ============================================
SELECT public.create_user('99999999-9999-9999-9999-999999999999', 'cpo@example.com', 'CPO@123', 'cpo');

INSERT INTO public.profiles (id, email, full_name, role, phone, is_active)
VALUES 
    ('99999999-9999-9999-9999-999999999999', 'cpo@example.com', 'Sophie Laurent', 'cpo', '+33 1 99 99 99 99', true);

-- ============================================
-- STEP 8: CLEANUP HELPER FUNCTION
-- ============================================
DROP FUNCTION IF EXISTS public.create_user;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Database cleaned and reseeded successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '🏥 Hospital Accounts (Europe):';
    RAISE NOTICE '   Email: hospital.paris@example.com | Password: Hospital@123';
    RAISE NOTICE '   Email: hospital.berlin@example.com | Password: Hospital@123';
    RAISE NOTICE '';
    RAISE NOTICE '🏭 Vendor Accounts (Europe):';
    RAISE NOTICE '   Email: vendor.amsterdam@example.com | Password: Vendor@123';
    RAISE NOTICE '   Email: vendor.madrid@example.com | Password: Vendor@123';
    RAISE NOTICE '   Email: vendor.rome@example.com | Password: Vendor@123';
    RAISE NOTICE '';
    RAISE NOTICE '👨‍💼 Admin Account:';
    RAISE NOTICE '   Email: cpo@example.com | Password: CPO@123';
END $$;
