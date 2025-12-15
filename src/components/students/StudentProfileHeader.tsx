'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Calendar, CreditCard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SellPackageDialog } from './SellPackageDialog';

interface StudentProfileHeaderProps {
    student: any;
    balance: any;
}

export function StudentProfileHeader({ student, balance }: StudentProfileHeaderProps) {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a Estudiantes
            </Button>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Main Info Card */}
                <Card className="flex-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">
                                    {student.first_name} {student.last_name}
                                </h1>
                                <div className="flex gap-2 mb-4">
                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                        {student.status === 'active' ? 'Activo' : student.status}
                                    </Badge>
                                    {student.license_number && (
                                        <Badge variant="outline">
                                            Licencia: {student.license_number}
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {student.email || 'Sin email'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {student.phone || 'Sin teléfono'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Registrado: {new Date(student.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <SellPackageDialog studentId={student.id} studentName={`${student.first_name} ${student.last_name}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Balance Card */}
                <Card className="w-full md:w-80">
                    <CardContent className="p-6 flex flex-col justify-center h-full">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-medium">Cuenta Corriente</span>
                        </div>
                        <div className={cn("text-4xl font-bold",
                            balance.balance < 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                            ${balance.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Deuda Total: ${balance.total_debt?.toLocaleString() || 0}
                            <br />
                            Pagado: ${balance.total_paid?.toLocaleString() || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
