import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface FormData {
  landlordName?: string;
  tenantName?: string;
  propertyAddress?: string;
  monthlyRent?: string;
  securityDeposit?: string;
  tenurePeriod?: string;
  startDate?: string;
  city?: string;
  state?: string;
  [key: string]: string | undefined;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export async function generatePdf(
  docType: string,
  formData: FormData,
  docId: string
): Promise<string> {
  const filePath = path.join(UPLOADS_DIR, `${docId}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(docType.toUpperCase().replace(/-/g, ' '), {
      align: 'center',
    });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, {
      align: 'center',
    });
    doc.moveDown(2);

    switch (docType) {
      case 'rent-agreement':
        buildRentAgreement(doc, formData);
        break;
      default:
        buildGenericDocument(doc, docType, formData);
    }

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

function buildRentAgreement(doc: PDFKit.PDFDocument, f: FormData) {
  const line = (label: string, value: string) => {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value || 'N/A');
    doc.moveDown(0.4);
  };

  doc.font('Helvetica').fontSize(11).text(
    `This Rent Agreement is entered into on ${formatDate(f.startDate)} between:`
  );
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('PARTIES');
  doc.moveDown(0.5);
  doc.fontSize(11);
  line('Landlord', f.landlordName || '');
  line('Tenant', f.tenantName || '');
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('PROPERTY');
  doc.moveDown(0.5);
  doc.fontSize(11);
  line('Address', f.propertyAddress || '');
  line('City', f.city || '');
  line('State', f.state || '');
  doc.moveDown();

  doc.fontSize(12).font('Helvetica-Bold').text('TERMS');
  doc.moveDown(0.5);
  doc.fontSize(11);
  line('Monthly Rent', `₹${f.monthlyRent || '0'}`);
  line('Security Deposit', `₹${f.securityDeposit || '0'}`);
  line('Tenure', `${f.tenurePeriod || '0'} months`);
  line('Start Date', formatDate(f.startDate));
  doc.moveDown(2);

  doc.font('Helvetica').fontSize(10).text(
    'This agreement is binding on both parties as per the Indian Contract Act, 1872.'
  );
  doc.moveDown(3);

  doc.font('Helvetica-Bold').text('Landlord Signature: _________________     Tenant Signature: _________________');
}

function buildGenericDocument(
  doc: PDFKit.PDFDocument,
  docType: string,
  formData: FormData
) {
  doc.fontSize(11).font('Helvetica');
  Object.entries(formData).forEach(([key, value]) => {
    if (value) {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
      doc.moveDown(0.4);
    }
  });
  doc.moveDown(2);
  doc.fontSize(10).text(
    `This ${docType.replace(/-/g, ' ')} has been generated using NyayAI and is subject to applicable Indian laws.`
  );
}
