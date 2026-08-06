import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

/**
 * Configure Cloudinary SDK v2
 */
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

export const cloudinaryConfig = {
  cloudName: env.cloudinary.cloudName,
  apiKey: env.cloudinary.apiKey,
  apiSecret: env.cloudinary.apiSecret,
  isConfigured: () =>
    Boolean(
      env.cloudinary.cloudName &&
        env.cloudinary.apiKey &&
        env.cloudinary.apiSecret
    ),
};

export default cloudinary;
