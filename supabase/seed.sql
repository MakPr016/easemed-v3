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
