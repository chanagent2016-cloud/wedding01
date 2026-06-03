-- -----------------------------------------------------
-- Supabase Schema for Wedding RSVP & Contribution App
-- -----------------------------------------------------

-- Create the custom Type/Constraint check for Currency and Status (optional, but handled inline as checks for maximum compatibility)

-- 1. Create the `wedding_contributions` table
CREATE TABLE IF NOT EXISTS wedding_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name TEXT NOT NULL,
    relationship TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'KHR')),
    blessing TEXT DEFAULT 'សូមជូនពរឱ្យកូនកំលោះកូនក្រមុំមានសុភមង្គល!',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the `wedding_hosts` table (In case you want to migrate host accounts to Supabase in the future)
CREATE TABLE IF NOT EXISTS wedding_hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    fullname TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------
-- Enable Row Level Security (RLS) for Security
-- -----------------------------------------------------

-- Enable RLS on tables
ALTER TABLE wedding_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_hosts ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- Row Level Security (RLS) Policies
-- -----------------------------------------------------

-- Policies for `wedding_contributions`
-- Anyone (public/anon) can view contributions (usually we want guests to see blessings)
CREATE POLICY "Allow public select on contributions" 
ON wedding_contributions 
FOR SELECT 
USING (true);

-- Anyone (public/anon) can submit a new contribution (default is 'pending')
CREATE POLICY "Allow public insert on contributions" 
ON wedding_contributions 
FOR INSERT 
WITH CHECK (true);

-- Authenticated roles or hosts can update/delete entries
-- Note: If you connect via the service_role key or keep anon key with broad controls, you can use these.
-- Since the frontend app updates statuses using the Anon key directly, we allow all operations under anon.
-- If you want absolute security, you can restrict update/delete to authenticated users, but since the frontend uses custom password checks locally, we allow public update/delete:
CREATE POLICY "Allow public update on contributions" 
ON wedding_contributions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on contributions" 
ON wedding_contributions 
FOR DELETE 
USING (true);


-- Policies for `wedding_hosts`
CREATE POLICY "Allow public select on hosts" 
ON wedding_hosts 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert/update/delete on hosts" 
ON wedding_hosts 
FOR ALL 
USING (true);

-- -----------------------------------------------------
-- Insert Initial Mock Data
-- -----------------------------------------------------

INSERT INTO wedding_contributions (guest_name, relationship, amount, currency, blessing, status, created_at)
VALUES 
('លោកពូ សុខ ជា', 'មា (Uncle)', 100.00, 'USD', 'សូមជូនពរឱ្យក្មួយទាំងពីរទទួលបាននូវសេចក្តីសុខ សុភមង្គល និងស្រលាញ់គ្នាដល់ចាស់កោងខ្នង!', 'approved', NOW() - INTERVAL '1.5 days'),
('អ្នកមីង ចាន់ ធីដា', 'មីង (Aunt)', 400000.00, 'KHR', 'សូមឱ្យអាពាហ៍ពិពាហ៍របស់ក្មួយៗ ពោរពេញដោយសុភមង្គល សុខសន្តិភាព និងរកស៊ីមានបានគ្រប់ក្រុមគ្រួសារ!', 'approved', NOW() - INTERVAL '1.2 days'),
('សេង វណ្ណៈ', 'មិត្តភក្តិជិតស្និទ្ធ (Close Friend)', 50.00, 'USD', 'រីករាយថ្ងៃអាពាហ៍ពិពាហ៍! សូមឱ្យស្រឡាញ់គ្នាស្មោះស្ម័គ្រ និងមានលុយប្រើពេញៗដៃគ្រប់ពេលណា!', 'approved', NOW() - INTERVAL '0.8 days'),
('លោកស្រី គឹម ហុង', 'អ្នកជិតខាង (Neighbor)', 120000.00, 'KHR', 'សូមជូនពរកូនប្រុសកូនស្រីទាំងពីរ ឱ្យមានទ្រព្យស្តុកស្តម្ភ និងត្រជាក់ត្រជុំរៀបការរួចរកស៊ីកាន់តែមានៗ!', 'pending', NOW() - INTERVAL '3 hours'),
('រ៉េត សុភ័ក្ត្រ', 'មិត្តរួមការងារ (Colleague)', 40.00, 'USD', 'សូមជូនពរឱ្យគូស្រករដ៏ស្រស់ស្អាតទាំងពីរ មានសុភមង្គល និងជោគជ័យគ្រប់ការងារ!', 'pending', NOW() - INTERVAL '20 minutes')
ON CONFLICT DO NOTHING;

-- Insert default host users
INSERT INTO wedding_hosts (username, password_hash, fullname)
VALUES 
('hieng', '123', 'កូនកំលោះ ហៀង (Hieng)'),
('sreymom', '123', 'កូនក្រមុំ ស្រីមុំ (Sreymom)'),
('heang', '619966', 'ម្ចាស់ដើមការ ហៀង (Heang)')
ON CONFLICT (username) DO NOTHING;
