'use server'
import { createClient } from '@/lib/supabase/server';
import { createStudent } from '../dashboard/students/actions';
import { createInstructor } from '../dashboard/instructors/actions';
import { createVehicle } from '../dashboard/vehicles/actions';

export async function seedData() {
    console.log('Starting seed...');

    // Check membership
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    let membershipId = null;
    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (membership) {
        membershipId = membership.id;
    } else {
        console.log('Inicializando escuela para nuevo usuario...');
        // 1. Create Owner
        const { data: owner, error: oError } = await supabase.from('owners').insert({
            name: 'Escuela Demo de ' + (user.email?.split('@')[0] || 'Usuario'),
            email: user.email,
            status: 'active'
        }).select().single();

        if (oError) {
            console.error('Error creating owner:', oError);
            // Si falla crear owner, tal vez ya existe uno linkeado? O RLS.
        }

        if (owner) {
            // 2. Create School
            const { data: school } = await supabase.from('schools').insert({
                owner_id: owner.id,
                name: 'Sede Principal',
                slug: 'sede-' + Math.random().toString(36).substring(7), // Unique slug
                status: 'active'
            }).select().single();

            if (school) {
                // 3. Create Location
                const { data: location } = await supabase.from('locations').insert({
                    school_id: school.id,
                    name: 'Sucursal Centro',
                    address: 'Av. Principal 123',
                    status: 'active'
                }).select().single();

                if (location) {
                    // 4. Create Membership
                    const { data: newMem } = await supabase.from('memberships').insert({
                        user_id: user.id,
                        school_id: school.id,
                        owner_id: owner.id,
                        location_id: location.id,
                        role: 'owner',
                        status: 'active'
                    }).select().single();

                    if (newMem) membershipId = newMem.id;
                }
            }
        }
    }

    // Si aún no hay membresía (por error en creación), fallará después en las acciones individuales
    // pero intentamos lo mejor.

    // 3 Students
    const students = [
        { first_name: 'Ana', last_name: 'García', email: 'ana@test.com', phone: '11111111', license_number: 'A123' },
        { first_name: 'Carlos', last_name: 'Díaz', email: 'carlos@test.com', phone: '22222222', license_number: 'B456' },
        { first_name: 'Elena', last_name: 'Ruiz', email: 'elena@test.com', phone: '33333333', license_number: 'C789' }
    ];

    // 3 Instructors
    const instructors = [
        { first_name: 'Prof. Mario', last_name: 'Rossi', email: 'mario@school.com', phone: '44444444', license_number: 'INS01', license_expiry: '2030-01-01' },
        { first_name: 'Prof. Laura', last_name: 'Vega', email: 'laura@school.com', phone: '55555555', license_number: 'INS02', license_expiry: '2030-01-01' },
        { first_name: 'Prof. Pablo', last_name: 'Mendez', email: 'pablo@school.com', phone: '66666666', license_number: 'INS03', license_expiry: '2030-01-01' }
    ];

    // 3 Vehicles
    const vehicles = [
        { brand: 'Toyota', model: 'Corolla', year: '2023', license_plate: 'AA111BB', transmission_type: 'automatic' },
        { brand: 'Volkswagen', model: 'Gol', year: '2022', license_plate: 'CC222DD', transmission_type: 'manual' },
        { brand: 'Ford', model: 'Fiesta', year: '2021', license_plate: 'EE333FF', transmission_type: 'manual' }
    ];

    // Execute sequencialmente para no saturar connection pool si es chico
    for (const s of students) {
        const formData = new FormData();
        Object.entries(s).forEach(([k, v]) => formData.append(k, v));
        await createStudent(formData);
    }

    for (const i of instructors) {
        const formData = new FormData();
        Object.entries(i).forEach(([k, v]) => formData.append(k, v));
        await createInstructor(formData);
    }

    for (const v of vehicles) {
        const formData = new FormData();
        Object.entries(v).forEach(([k, v]) => formData.append(k, v));
        await createVehicle(formData);
    }

    console.log('Seeding completed');
    return { success: true };
}
