import mongoose from 'mongoose';
import { generatePdf } from './backend/src/utils/pdf';

async function run() {
  try {
    console.log('Generating PDF and uploading to Cloudinary...');
    const url = await generatePdf('rent-agreement', {
      landlordName: 'Test Landlord',
      tenantName: 'Test Tenant',
      monthlyRent: '15000'
    }, 'test-doc-123');
    console.log('Success! Cloudinary URL:', url);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    process.exit(0);
  }
}
run();
