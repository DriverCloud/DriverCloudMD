export interface ActionState {
    success: boolean;
    error?: string;
    data?: any;
}

export interface Student {
    id: string;
    school_id: string;
    owner_id: string;
    location_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    has_license: boolean;
    disability_observation?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    gender?: string;
    status: 'active' | 'graduated' | 'inactive' | 'deleted';
    user_id?: string; // Linked Supabase Auth User ID
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface Vehicle {
    id: string;
    school_id: string;
    owner_id: string;
    location_id: string;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    transmission_type: 'manual' | 'automatic';
    status: 'active' | 'maintenance' | 'inactive';
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    // Maintenance
    current_mileage?: number;
    last_service_mileage?: number;
    service_interval_km?: number;
    last_service_date?: string;
}

export interface Instructor {
    id: string;
    school_id: string;
    owner_id: string;
    location_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    cuil?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    license_number?: string;
    license_expiry?: string;
    salary_type: 'per_class' | 'monthly' | 'mixed';
    base_salary: number;
    price_per_class: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface MaintenanceRecord {
    id: string;
    vehicle_id: string;
    date: string;
    type: string;
    description?: string;
    mileage?: number;
    cost?: number;
    provider?: string;
    created_at: string;
}

export interface VehicleDocument {
    id: string;
    vehicle_id: string;
    type: string;
    issue_date?: string;
    expiry_date: string;
    notes?: string;
    created_at: string;
}

export interface MaintenanceSchedule {
    id: string;
    vehicle_id: string;
    service_name: string;
    interval_km: number;
    last_service_km: number;
    last_service_date?: string;
}

export interface Appointment {
    id: string;
    school_id: string;
    owner_id: string;
    location_id: string;
    student_id: string;
    instructor_id: string;
    vehicle_id: string;
    class_type_id: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    notes?: string;
    class_number?: number;
    created_at: string;
    updated_at: string;
    // Relations (simplified)
    student?: { first_name: string; last_name: string };
    instructor?: { first_name: string; last_name: string };
    vehicle?: { brand: string; model: string; license_plate: string };
    class_type?: { name: string; duration_minutes: number };
    package?: { total_credits: number };
}
