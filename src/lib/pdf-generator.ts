import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const generatePaymentReceipt = (payment: any, student: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text('DriverCloudMD', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Comprobante de Pago', 20, 26);

    // Date and ID
    const dateStr = format(new Date(), "d 'de' MMMM, yyyy - HH:mm", { locale: es });
    doc.text(`Fecha: ${dateStr}`, pageWidth - 20, 20, { align: 'right' });
    doc.text(`ID Transacción: ${payment.id?.slice(0, 8) || 'PENDIENTE'}`, pageWidth - 20, 26, { align: 'right' });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, pageWidth - 20, 35);

    // Student Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Recibí de:', 20, 50);
    doc.setFontSize(14);
    doc.text(`${student.first_name} ${student.last_name}`, 20, 58);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (student.dni) doc.text(`DNI: ${student.dni}`, 20, 64);

    // Payment Details
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 80, pageWidth - 40, 40, 'F');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Concepto:', 30, 95);
    doc.text(payment.notes || 'Pago a cuenta', 80, 95);

    doc.text('Método:', 30, 108);
    // Translate payment method
    const methodMap: Record<string, string> = {
        'cash': 'Efectivo',
        'transfer': 'Transferencia',
        'credit_card': 'Tarjeta de Crédito',
        'debit_card': 'Tarjeta de Débito'
    };
    doc.text(methodMap[payment.payment_method] || payment.payment_method, 80, 108);

    // Amount (Highlight)
    doc.setFontSize(16);
    doc.text('Total:', pageWidth - 80, 108);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.setFont('helvetica', 'bold');
    doc.text(`$${Number(payment.amount).toLocaleString()}`, pageWidth - 30, 108, { align: 'right' });

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por confiar en nosotros.', 20, 140);

    doc.save(`Recibo_${student.last_name}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
