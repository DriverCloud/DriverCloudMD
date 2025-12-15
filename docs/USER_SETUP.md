# User Setup Guide

## Quick Start

Follow these steps to create test users and link them to the database:

### Step 1: Create Users in Supabase Dashboard

1. Go to [Supabase Dashboard → Auth → Users](https://supabase.com/dashboard/project/vublkwjavuslbmglxikt/auth/users)
2. Click **"Add user"** → **"Create new user"**
3. Create these 3 users:

#### Admin User
- **Email:** `admin@drivercloud.com`
- **Password:** `Admin123!` (or your choice)
- **Auto Confirm Email:** ✅ (check this box)

#### Student User
- **Email:** `juan.perez@example.com`
- **Password:** `Student123!`
- **Auto Confirm Email:** ✅

#### Instructor User
- **Email:** `maria.gonzalez@example.com`
- **Password:** `Instructor123!`
- **Auto Confirm Email:** ✅

### Step 2: Run Setup Script

1. Go to [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/vublkwjavuslbmglxikt/sql/new)
2. Copy the entire content of `scripts/setup-users.sql`
3. Paste it into the SQL Editor
4. Click **"Run"**

This script will:
- ✅ Link Juan Pérez to the student user
- ✅ Link María González to the instructor user
- ✅ Create memberships for all 3 users
- ✅ Verify everything is set up correctly

### Step 3: Test Login

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Test each user:

**As Admin:**
- Email: `admin@drivercloud.com`
- Should see full dashboard with all data

**As Student:**
- Email: `juan.perez@example.com`
- Should see only their own appointments and credits

**As Instructor:**
- Email: `maria.gonzalez@example.com`
- Should see only their own appointments

---

## Troubleshooting

### "User already exists"
If you get this error, the user was already created. Just run Step 2 (setup script) to create memberships.

### "Email not confirmed"
Make sure you checked **"Auto Confirm Email"** when creating the user. If you forgot, you can confirm manually:
1. Go to Auth → Users
2. Click on the user
3. Click "Confirm email"

### "Cannot read properties of null"
This means the membership wasn't created. Run the setup script again (Step 2).

### Dev server not running
```bash
# Kill any existing processes
taskkill /F /IM node.exe

# Start fresh
npm run dev
```

---

## What's Next?

After setting up users, you can:

1. **Test RLS Policies:** Login as different users and verify they only see their data
2. **Update Frontend:** Replace mock data with real Supabase queries
3. **Create More Data:** Add more students, instructors, appointments via the dashboard

See `walkthrough.md` for detailed next steps.
