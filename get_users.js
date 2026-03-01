const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.log("Could not find Supabase credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
    const { data: instructors } = await supabase
        .from('instructors')
        .select('id, first_name, last_name, email')
        .ilike('first_name', '%nicola%');

    console.log("Instructors:", instructors);

    const { data: students } = await supabase
        .from('students')
        .select('id, first_name, last_name, email, user_id')
        .ilike('first_name', '%robert%');

    console.log("Students:", students);
}

run();
