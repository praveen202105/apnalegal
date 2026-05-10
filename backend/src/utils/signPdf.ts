import { PDFDocument } from 'pdf-lib';

export async function stampSignatureOnPdf(
  pdfBuffer: Buffer,
  signaturePngBase64: string,
  signerName: string
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  const cleanBase64 = signaturePngBase64.replace(/^data:image\/png;base64,/, '');
  const pngImage = await pdfDoc.embedPng(Buffer.from(cleanBase64, 'base64'));

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();

  const sigWidth = 160;
  const sigHeight = 60;
  const margin = 50;
  const x = width - sigWidth - margin;
  const y = margin + 20;

  lastPage.drawImage(pngImage, { x, y, width: sigWidth, height: sigHeight });

  lastPage.drawText(`Signed by: ${signerName}`, {
    x,
    y: y - 12,
    size: 8,
  });
  lastPage.drawText(`Date: ${new Date().toISOString().slice(0, 10)}`, {
    x,
    y: y - 24,
    size: 8,
  });

  const out = await pdfDoc.save();
  return Buffer.from(out);
}
