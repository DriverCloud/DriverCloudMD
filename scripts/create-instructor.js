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
    const email = 'alvolante40@gmail.com';
    const password = 'Instructor123!';

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
            full_name: 'Instructor Prueba'
        }
    });

    if (createError) {
        console.error('Error creating user:', createError);
        return;
    }

    console.log('User created:', user.user.id);

    // 3. Create Instructor Profile
    // Note: Assuming School ID and Location ID are fixed for the demo/first school found
    let school_id = '00000000-0000-0000-0000-000000000002'; // Default mock
    let location_id = '00000000-0000-0000-0000-000000000003'; // Default mock
    let owner_id = '00000000-0000-0000-0000-000000000001'; // Default mock

    // Try to find a real school if mocks fail
    const { data: schools } = await supabase.from('schools').select('id, owner_id').limit(1);
    if (schools && schools.length > 0) {
        school_id = schools[0].id;
        owner_id = schools[0].owner_id;
        console.log('Using School ID:', school_id, 'Owner ID:', owner_id);
    }

    // 4. Create Instructor Record
    const { error: instrError } = await supabase
        .from('instructors')
        .insert({
            user_id: user.user.id,
            school_id: school_id,
            owner_id: owner_id, // ADDED THIS
            first_name: 'Instructor',
            last_name: 'Prueba',
            email: email,
            status: 'active'
        });

    if (instrError) {
        console.error('Error creating instructor profile:', instrError);
    } else {
        console.log('Instructor profile created.');
    }

    // 5. Create Membership
    const { error: memError } = await supabase
        .from('memberships')
        .insert({
            user_id: user.user.id,
            school_id: school_id,
            owner_id: owner_id,
            role: 'instructor'
        });

    if (memError) {
        console.error('Error creating membership:', memError);
    } else {
        console.log('Membership created.');
    }

    console.log('Done! You can now login.');
}

main();
