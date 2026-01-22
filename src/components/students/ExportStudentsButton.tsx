'use client'

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportStudentsButtonProps {
    students: any[];
}

export function ExportStudentsButton({ students }: ExportStudentsButtonProps) {
    const handleExport = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text('Lista de Estudiantes - DriverCloud', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Nombre", "Email", "Teléfono", "DNI", "Estado", "Saldo"];
        const tableRows: any[] = [];

        const statusMap: Record<string, string> = {
            active: 'Activo',
            paused: 'En Pausa',
            finished: 'Finalizado',
            graduated: 'Graduado',
            failed: 'Reprobado',
            abandoned: 'Abandono',
            inactive: 'Inactivo'
        };

        students.forEach(student => {
            const balance = student.balance || 0;
            const studentData = [
                `${student.first_name} ${student.last_name}`,
                student.email || 'N/A',
                student.phone || 'N/A',
                student.dni || 'N/A',
                statusMap[student.status] || student.status,
                `$${balance.toLocaleString()}`
            ];
            tableRows.push(studentData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [51, 122, 183] }, // Blueish color
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`estudiantes_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
        </Button>
    );
}
