import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const url = cloudinary.utils.url('nyayai_docs/test-doc-premium-123.pdf', {
  resource_type: 'raw',
  sign_url: true,
  secure: true
});
console.log('SIGNED URL:', url);
