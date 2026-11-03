-- Intelligent Land Record Digitization and Validation System
-- Database Initialization Script for PostgreSQL 14+ / 16+

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'officer',
    department VARCHAR(255) DEFAULT 'Department of Land Revenue',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS land_records (
    id SERIAL PRIMARY KEY,
    owner_name VARCHAR(255) NOT NULL,
    survey_number VARCHAR(100) NOT NULL,
    ulpin VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluk VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    land_area NUMERIC(10, 2) NOT NULL,
    land_unit VARCHAR(50) DEFAULT 'Acres',
    land_type VARCHAR(100) DEFAULT 'Agricultural',
    document_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS uploaded_documents (
    id SERIAL PRIMARY KEY,
    record_id INTEGER REFERENCES land_records(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    ocr_raw_text TEXT,
    ocr_extracted_data JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS validation_results (
    id SERIAL PRIMARY KEY,
    record_id INTEGER UNIQUE REFERENCES land_records(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    error_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    errors_json JSONB DEFAULT '[]'::jsonb,
    warnings_json JSONB DEFAULT '[]'::jsonb,
    suggestions_json JSONB DEFAULT '[]'::jsonb,
    rules_evaluated_json JSONB DEFAULT '[]'::jsonb,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_land_records_survey ON land_records(survey_number);
CREATE INDEX IF NOT EXISTS idx_land_records_ulpin ON land_records(ulpin);
CREATE INDEX IF NOT EXISTS idx_land_records_status ON land_records(status);
CREATE INDEX IF NOT EXISTS idx_land_records_district ON land_records(district);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at DESC);

-- 2. Seed Demo Users
-- admin123 and officer123 pre-hashed (SHA-256 for simple portable compatibility or standard bcrypt)
-- admin: 'admin@landrecords.gov.in', password: 'admin123'
-- officer: 'officer@landrecords.gov.in', password: 'officer123'
INSERT INTO users (email, hashed_password, full_name, role, department)
VALUES
    ('admin@landrecords.gov.in', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Rajesh Sharma (Admin)', 'admin', 'State Land Administration Directorate'),
    ('officer@landrecords.gov.in', '3e3d64fe3fa03f56d4ddb59c4a85fa06669eeff12933d3c7e3f88fdfb5eb7dd9', 'Priya Deshmukh (Verification Officer)', 'officer', 'Taluk Revenue Office - Bengaluru North')
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Realistic Land Records
INSERT INTO land_records (id, owner_name, survey_number, ulpin, district, taluk, village, land_area, land_unit, land_type, document_number, status, notes, created_at, created_by_id)
VALUES
    (1, 'Ramesh Kumar Gowda', '142/3A', 'KA-BLR-2024-981021', 'Bengaluru Urban', 'Bengaluru North', 'Yelahanka', 3.75, 'Acres', 'Agricultural', 'DOC-2024-REG-7819', 'Verified', 'All boundaries matching survey GIS coordinates. Clear title deed.', '2026-09-12 10:30:00+00', 1),
    (2, 'Ananya Sundaram', '88/1B', 'KA-BLR-2024-441920', 'Bengaluru Urban', 'Bengaluru South', 'Begur', 1.20, 'Acres', 'Residential Conversion', 'DOC-2024-REG-8821', 'Verified', 'Converted to NA residential vide DC order dated 14/02/2024.', '2026-09-18 11:15:00+00', 2),
    (3, 'Mohammed Farooq Khan', '215/4', 'KA-MYS-2024-110293', 'Mysuru', 'Hunsur', 'Bilagula', 4.50, 'Acres', 'Agricultural', 'DOC-2024-REG-9012', 'Pending', 'Awaiting field surveyor cross-verification for sub-division 4.', '2026-10-02 09:40:00+00', 2),
    (4, 'Suresh Chandra Patel', '33/2C', 'KA-TUM-2024-554201', 'Tumakuru', 'Tiptur', 'Kibbanahalli', 6.80, 'Acres', 'Plantation / Commercial', 'DOC-2024-REG-9430', 'Pending', 'OCR extracted area 6.80 acres matches document; mutation pending.', '2026-10-10 14:20:00+00', 2),
    (5, 'Sunita Devi Yadav', '109/X', 'KA-BLR-2024-001928', 'Bengaluru Urban', 'Anekal', 'Sarjapura', -2.50, 'Acres', 'Agricultural', 'INV-DOC-000', 'Rejected', 'Negative land area and invalid survey sub-division. Document rejected.', '2026-10-15 16:00:00+00', 1),
    (6, 'Vikramaditya Rao', '52/1A', 'KA-BLR-2024-772189', 'Bengaluru Rural', 'Devanahalli', 'Vijayapura', 5.25, 'Acres', 'Industrial Zone', 'DOC-2024-REG-9801', 'Verified', 'KIADB clearance certified and verified against survey record.', '2026-10-20 12:10:00+00', 1),
    (7, 'Lakshmi Narayana Swamy', '142/3A', 'KA-BLR-2024-998811', 'Bengaluru Urban', 'Bengaluru North', 'Yelahanka', 2.10, 'Acres', 'Agricultural', 'DOC-2024-REG-9911', 'Rejected', 'Conflict: Duplicate Survey Number 142/3A already assigned in Yelahanka village.', '2026-10-22 15:45:00+00', 2),
    (8, 'Gurpreet Singh Gill', '304/6', 'KA-BEL-2024-332901', 'Belagavi', 'Chikkodi', 'Nipani Rural', 8.40, 'Acres', 'Agricultural', 'DOC-2024-REG-1014', 'Verified', 'Duly signed Patta and Encumbrance Certificate uploaded.', '2026-10-25 10:00:00+00', 1),
    (9, 'Kavitha Radhakrishnan', '19/7D', 'KA-MYS-2024-664410', 'Mysuru', 'Nanjangud', 'Hadinaru', 2.85, 'Acres', 'Agricultural', 'DOC-2024-REG-1055', 'Pending', 'Recently submitted for digitisation; OCR processing completed.', '2026-10-28 11:30:00+00', 2),
    (10, 'Deepak Varma', '77/3', 'KA-BLR-2024-889922', 'Bengaluru Urban', 'Bengaluru East', 'Varthur', 0.95, 'Acres', 'Commercial', 'DOC-2024-REG-1089', 'Verified', 'Clear survey map and tax receipts validated.', '2026-10-30 08:50:00+00', 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('land_records_id_seq', COALESCE((SELECT MAX(id) FROM land_records), 1));

-- 4. Seed Validation Results
INSERT INTO validation_results (record_id, status, error_count, warning_count, errors_json, warnings_json, suggestions_json, rules_evaluated_json, validated_at)
VALUES
    (1, 'Verified', 0, 0, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 
     '[{"rule": "Owner Name Check", "passed": true}, {"rule": "Survey Number Check", "passed": true}, {"rule": "Duplicate Survey Check", "passed": true}, {"rule": "Land Area Positive Check", "passed": true}, {"rule": "Location Completeness", "passed": true}, {"rule": "OCR Text Cross-Match", "passed": true}]'::jsonb,
     '2026-09-12 10:35:00+00'),
    (2, 'Verified', 0, 0, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 
     '[{"rule": "Owner Name Check", "passed": true}, {"rule": "Survey Number Check", "passed": true}, {"rule": "Duplicate Survey Check", "passed": true}, {"rule": "Land Area Positive Check", "passed": true}, {"rule": "Location Completeness", "passed": true}, {"rule": "OCR Text Cross-Match", "passed": true}]'::jsonb,
     '2026-09-18 11:20:00+00'),
    (3, 'Pending', 0, 1, '[]'::jsonb, 
     '["Sub-division boundary requires secondary survey GIS inspection."]'::jsonb, 
     '["Field inspection scheduled by verification officer."]'::jsonb,
     '[{"rule": "Owner Name Check", "passed": true}, {"rule": "Survey Number Check", "passed": true}, {"rule": "Duplicate Survey Check", "passed": true}, {"rule": "Land Area Positive Check", "passed": true}, {"rule": "Location Completeness", "passed": true}, {"rule": "OCR Text Cross-Match", "passed": true, "note": "Minor punctuation difference in Owner initial"}]'::jsonb,
     '2026-10-02 09:45:00+00'),
    (5, 'Rejected', 2, 0, 
     '["Land area cannot be negative (-2.50 Acres).", "Invalid document number format (INV-DOC-000)."]'::jsonb,
     '[]'::jsonb, 
     '["Correct the land area in Form 7A to a positive real value.", "Upload a registered sale deed or RTC certificate with standard DOC-YYYY-REG-XXXX format."]'::jsonb,
     '[{"rule": "Owner Name Check", "passed": true}, {"rule": "Survey Number Check", "passed": true}, {"rule": "Duplicate Survey Check", "passed": true}, {"rule": "Land Area Positive Check", "passed": false}, {"rule": "Location Completeness", "passed": true}, {"rule": "Document Number Format Check", "passed": false}]'::jsonb,
     '2026-10-15 16:05:00+00'),
    (7, 'Rejected', 1, 0, 
     '["Duplicate Survey Number 142/3A detected in Village Yelahanka, District Bengaluru Urban. Already registered under Record #1."]'::jsonb,
     '[]'::jsonb, 
     '["Check if this parcel is a sub-plot (e.g., 142/3A-1) or resolve title overlap dispute."]'::jsonb,
     '[{"rule": "Owner Name Check", "passed": true}, {"rule": "Survey Number Check", "passed": true}, {"rule": "Duplicate Survey Check", "passed": false}, {"rule": "Land Area Positive Check", "passed": true}, {"rule": "Location Completeness", "passed": true}]'::jsonb,
     '2026-10-22 15:50:00+00')
ON CONFLICT (record_id) DO NOTHING;

-- 5. Seed Activity Logs
INSERT INTO activity_logs (user_email, action, details, ip_address, created_at)
VALUES
    ('admin@landrecords.gov.in', 'SYSTEM_INITIALIZATION', 'System tables and default government schemas initialized', '127.0.0.1', '2026-09-01 08:00:00+00'),
    ('officer@landrecords.gov.in', 'RECORD_CREATED', 'Created Record #1 for Ramesh Kumar Gowda (Survey 142/3A)', '192.168.1.104', '2026-09-12 10:30:00+00'),
    ('officer@landrecords.gov.in', 'VALIDATION_COMPLETED', 'Intelligent validation completed for Record #1 (Status: Verified)', '192.168.1.104', '2026-09-12 10:35:00+00'),
    ('officer@landrecords.gov.in', 'RECORD_CREATED', 'Created Record #5 for Sunita Devi Yadav', '192.168.1.104', '2026-10-15 16:00:00+00'),
    ('officer@landrecords.gov.in', 'VALIDATION_FAILED', 'Validation detected negative area and invalid document on Record #5 (Status: Rejected)', '192.168.1.104', '2026-10-15 16:05:00+00'),
    ('officer@landrecords.gov.in', 'RECORD_CREATED', 'Attempted duplicate record registration Survey 142/3A (Record #7)', '192.168.1.104', '2026-10-22 15:45:00+00'),
    ('admin@landrecords.gov.in', 'RECORD_REJECTED', 'Administrator confirmed rejection of conflicting Record #7', '192.168.1.101', '2026-10-22 15:52:00+00');
