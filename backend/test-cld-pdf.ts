import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

import PDFDocument from 'pdfkit';

const doc = new PDFDocument();
const stream = cloudinary.uploader.upload_stream(
  { resource_type: 'image', public_id: 'test_image_pdf.pdf' },
  (error, result) => {
    if (error) console.error('Error:', error);
    if (result) console.log('IMAGE URL:', result.secure_url);
  }
);
doc.pipe(stream);
doc.text('Hello PDF image mode');
doc.end();
