const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
    }
});

const connectionString = env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase usually requires SSL
});

async function main() {
    try {
        await client.connect();

        const sql = `
        CREATE TABLE IF NOT EXISTS public.student_packages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            credits INTEGER NOT NULL DEFAULT 0,
            price DECIMAL(10, 2) NOT NULL DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        ALTER TABLE public.student_packages ENABLE ROW LEVEL SECURITY;

        -- Create policies only if they don't exist (Check not easily done in raw SQL without DO block, 
        -- but duplicate policy error is fine or we can use DO block)
        
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE tablename = 'student_packages' AND policyname = 'Enable read access for all users'
            ) THEN
                CREATE POLICY "Enable read access for all users" ON public.student_packages FOR SELECT USING (true);
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE tablename = 'student_packages' AND policyname = 'Enable insert for authenticated users only'
            ) THEN
                CREATE POLICY "Enable insert for authenticated users only" ON public.student_packages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            END IF;
        END
        $$;
        `;

        await client.query(sql);
        console.log('Table student_packages created/verified successfully.');

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await client.end();
    }
}

main();
