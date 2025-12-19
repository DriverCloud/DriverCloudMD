const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    const email = 'student_demo@gmail.com';

    // 1. Find Student
    const { data: students, error: sErr } = await supabase
        .from('students')
        .select('id')
        .eq('email', email)
        .limit(1);

    if (sErr || !students.length) {
        console.error('Student not found:', sErr);
        return;
    }
    const studentId = students[0].id;

    // 2. Create Package
    // Check if table is 'student_packages' or something else?
    // Based on actions.ts it is 'student_packages'.

    const { data, error } = await supabase
        .from('student_packages')
        .insert({
            student_id: studentId,
            name: 'Pack Inicial 10 Clases',
            credits: 10,
            price: 50000,
            status: 'active' // Guessing status column
        })
        .select();

    if (error) {
        console.error('Error creating package:', error);
        // Fallback: Maybe table is 'packages'?
        // If error says relation does not exist, we know.
    } else {
        console.log('Package assigned:', data);
    }
}

main();
