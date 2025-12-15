import { getStudentProfile } from '@/app/(auth)/(dashboard)/students/actions';
import { StudentProfileHeader } from '@/components/students/StudentProfileHeader';
import { ClassHistory } from '@/components/students/ClassHistory';
import { FinancialHistory } from '@/components/students/FinancialHistory';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define Props interface correctly for Next.js 15+
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentProfilePage({ params }: PageProps) {
    // Await params as required in newer Next.js versions
    const resolvedParams = await params;

    const data = await getStudentProfile(resolvedParams.id);

    if (!data) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-10">
            <StudentProfileHeader student={data.student} balance={data.balance} />

            <Tabs defaultValue="classes" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="classes">Clases y Planificación</TabsTrigger>
                    <TabsTrigger value="finance">Finanzas y Pagos</TabsTrigger>
                </TabsList>

                <TabsContent value="classes">
                    <ClassHistory appointments={data.appointments} />
                </TabsContent>

                <TabsContent value="finance">
                    <FinancialHistory packages={data.packages} payments={data.payments} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
