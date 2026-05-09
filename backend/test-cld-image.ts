import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.uploader.upload('package.json', { resource_type: 'raw', public_id: 'test_raw.json' })
  .then(res => console.log('RAW URL:', res.secure_url))
  .catch(console.error);
