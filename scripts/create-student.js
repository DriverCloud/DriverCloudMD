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
        env[key.trim()] = value.trim().replace(/"/g, ''); // Simple parsing
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    const email = 'student_demo@gmail.com';
    const password = 'Student123!';

    console.log(`Creating user ${email}...`);

    // 1. Check if user exists and delete if necessary (to start fresh)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        console.log('User exists. Deleting to start fresh...');
        const { error: delError } = await supabase.auth.admin.deleteUser(existingUser.id);
        if (delError) {
            console.error('Error deleting user:', delError);
            return;
        }
    }

    // 2. Create User
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Estudiante Demo'
        }
    });

    if (createError) {
        console.error('Error creating user:', createError);
        return;
    }

    console.log('User created:', user.user.id);

    // 3. Get School Details
    let school_id = '00000000-0000-0000-0000-000000000002'; // Default mock
    let location_id = '00000000-0000-0000-0000-000000000003'; // Default mock
    let owner_id = '00000000-0000-0000-0000-000000000001'; // Default mock

    const { data: schools } = await supabase.from('schools').select('id, owner_id').limit(1);
    if (schools && schools.length > 0) {
        school_id = schools[0].id;
        owner_id = schools[0].owner_id;
        console.log('Using School ID:', school_id, 'Owner ID:', owner_id);
    }

    // 4. Create Student Record
    const { error: studentError } = await supabase
        .from('students')
        .insert({
            user_id: user.user.id,
            school_id: school_id,
            owner_id: owner_id, // Added owner_id
            first_name: 'Estudiante',
            last_name: 'Demo',
            email: email,
            phone: '+5491112345678',
            dni: '12345678',
            address: 'Calle Falsa 123',
            status: 'active'
        });

    if (studentError) {
        console.error('Error creating student profile:', studentError);
    } else {
        console.log('Student profile created.');
    }

    // 5. Create Memberships
    const { error: memError } = await supabase
        .from('memberships')
        .insert({
            user_id: user.user.id,
            school_id: school_id,
            owner_id: owner_id,
            role: 'student'
        });

    if (memError) {
        console.error('Error creating membership:', memError);
    } else {
        console.log('Membership created.');
    }

    console.log('Done! You can now login as student.');
}

main();
