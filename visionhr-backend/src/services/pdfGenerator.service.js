import PDFDocument from 'pdfkit';

/**
 * Generates a clean, professional PDF payslip.
 * @param {Object} employee - The employee document containing personalDetails and organization.
 * @param {Object} payrollData - The computed payroll data (earnings, deductions, netSalary, etc).
 * @param {number} month - The payroll month (1-12).
 * @param {number} year - The payroll year (e.g., 2026).
 * @returns {Promise<Buffer>} - A promise that resolves with the PDF buffer.
 */
export const generatePayslipPdf = (employee, payrollData, month, year) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
      
      const formatCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

      // --- Header Section ---
      doc.fontSize(24).font('Helvetica-Bold').text('VisionHR', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('123 Corporate Blvd, Tech District, City, 400001', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(16).font('Helvetica-Bold').text(`Payslip for ${monthName} ${year}`, { align: 'center', underline: true });
      doc.moveDown(2);

      // --- Employee Details Section ---
      doc.fontSize(10).font('Helvetica-Bold').text('Employee Details', { underline: true });
      doc.moveDown(0.5);
      
      const detailsX = 50;
      const detailsY = doc.y;
      
      doc.font('Helvetica').text(`Name: ${employee.personalDetails.firstName} ${employee.personalDetails.lastName}`, detailsX, detailsY);
      doc.text(`Employee Code: ${employee.employeeCode}`, detailsX, detailsY + 15);
      doc.text(`Department: ${employee.organization?.department?.name || 'N/A'}`, detailsX, detailsY + 30);
      
      doc.text(`Designation: ${employee.organization?.designation || 'N/A'}`, detailsX + 250, detailsY);
      doc.text(`Total Working Days: ${payrollData.totalWorkingDays}`, detailsX + 250, detailsY + 15);
      doc.text(`Payable Days: ${payrollData.payableDays}`, detailsX + 250, detailsY + 30);
      
      doc.moveDown(4);

      // --- Salary Breakdown Table ---
      doc.fontSize(10).font('Helvetica-Bold').text('Salary Breakdown', detailsX, doc.y, { underline: true });
      doc.moveDown(1);
      
      const tableTop = doc.y;
      
      // Column Headers
      doc.font('Helvetica-Bold');
      doc.text('Earnings', detailsX, tableTop);
      doc.text('Amount', detailsX + 150, tableTop);
      doc.text('Deductions', detailsX + 280, tableTop);
      doc.text('Amount', detailsX + 430, tableTop);
      
      // Line separator
      doc.moveTo(detailsX, tableTop + 15).lineTo(545, tableTop + 15).stroke();
      
      doc.font('Helvetica');
      let currentY = tableTop + 25;
      const rowGap = 20;

      // Basic Salary & Tax
      doc.text('Basic Salary', detailsX, currentY);
      doc.text(formatCurrency(payrollData.earnings.basicSalary), detailsX + 150, currentY);
      doc.text('Tax Deduction', detailsX + 280, currentY);
      doc.text(formatCurrency(payrollData.deductions.taxDeduction), detailsX + 430, currentY);
      currentY += rowGap;

      // HRA & PF
      doc.text('House Rent Allowance', detailsX, currentY);
      doc.text(formatCurrency(payrollData.earnings.hra), detailsX + 150, currentY);
      doc.text('PF Deduction', detailsX + 280, currentY);
      doc.text(formatCurrency(payrollData.deductions.pfDeduction), detailsX + 430, currentY);
      currentY += rowGap;

      // Other Allowances & LOP
      doc.text('Other Allowances', detailsX, currentY);
      doc.text(formatCurrency(payrollData.earnings.otherAllowances), detailsX + 150, currentY);
      doc.text('Loss of Pay (Absences)', detailsX + 280, currentY);
      doc.text(formatCurrency(payrollData.deductions.lossOfPay), detailsX + 430, currentY);
      currentY += rowGap;

      // Bottom Line separator
      doc.moveTo(detailsX, currentY).lineTo(545, currentY).stroke();
      currentY += 10;

      // Gross Totals
      doc.font('Helvetica-Bold');
      doc.text('Gross Earnings', detailsX, currentY);
      doc.text(formatCurrency(payrollData.earnings.grossEarnings), detailsX + 150, currentY);
      doc.text('Total Deductions', detailsX + 280, currentY);
      doc.text(formatCurrency(payrollData.deductions.totalDeductions), detailsX + 430, currentY);

      doc.moveDown(4);

      // --- Net Salary Highlight ---
      doc.rect(detailsX, doc.y, 495, 40).fillAndStroke('#f3f4f6', '#d1d5db');
      doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold');
      doc.text(`Net Payable Salary: ${formatCurrency(payrollData.netSalary)}`, detailsX, doc.y - 28, { align: 'center' });
      
      doc.moveDown(4);
      doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Oblique').text('This is a computer generated document and requires no physical signature.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
