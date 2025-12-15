'use client'

import { useState } from 'react';
import { seedData } from './actions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('Idle');

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Seeding data...');
        try {
            await seedData();
            setStatus('Success! 3 Students, 3 Instructors, 3 Vehicles created.');
        } catch (e) {
            setStatus('Error seeding data.');
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Database Seeder</h1>
            <Button onClick={handleSeed} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar 3x3x3 Datos de Prueba
            </Button>
            <p className="text-muted-foreground">{status}</p>
        </div>
    );
}
