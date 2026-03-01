const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vublkwjavuslbmglxikt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Ymxrd2phdnVzbGJtZ2x4aWt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTczMzYxMSwiZXhwIjoyMDgxMzA5NjExfQ.j8D3GWaQgDVoR309U_KHFSBh6nh3TxEPdrYzALHxaCY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'donaelena@test.com',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: 'Elena' }
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('User already exists. Updating password...');
            const { data: users } = await supabase.auth.admin.listUsers();
            const user = users.users.find(u => u.email === 'donaelena@test.com');
            if (user) {
                await supabase.auth.admin.updateUserById(user.id, { password: 'Password123!' });
                console.log('Password updated and user confirmed for donaelena@test.com');
            }
        } else {
            console.error('Error creating user:', error);
        }
    } else {
        console.log('User created and confirmed:', data?.user?.email);
    }
}

createTestUser();
