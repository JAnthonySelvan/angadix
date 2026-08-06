import cloudinary, { cloudinaryConfig } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

class UploadService {
  /**
   * Check if Cloudinary credentials are fully configured.
   */
  isConfigured() {
    return cloudinaryConfig.isConfigured();
  }

  /**
   * Upload a memory buffer stream directly to Cloudinary
   * @param {Buffer} buffer - File buffer from multer memoryStorage
   * @param {Object} options - Upload options (folder, resource_type, public_id, etc.)
   * @returns {Promise<{ url: string, publicId: string }>}
   */
  async uploadBuffer(buffer, options = {}) {
    if (!this.isConfigured()) {
      throw new ApiError(
        500,
        'Cloudinary service is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      );
    }

    const defaultOptions = {
      folder: 'angadix/products',
      resource_type: 'auto',
      ...options,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            return reject(
              new ApiError(
                500,
                `Cloudinary upload failed: ${error.message || 'Unknown error'}`,
                [error]
              )
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload multiple image buffers sequentially or in parallel
   * @param {Array<{ buffer: Buffer }>} files - Array of multer file objects
   * @param {string} folder - Destination folder in Cloudinary
   * @returns {Promise<Array<{ url: string, publicId: string, isPrimary: boolean }>>}
   */
  async uploadMultipleImages(files = [], folder = 'angadix/products') {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map((file, index) =>
      this.uploadBuffer(file.buffer, {
        folder,
        resource_type: 'image',
      }).then((res) => ({
        ...res,
        isPrimary: index === 0, // First image is marked primary by default
      }))
    );

    return await Promise.all(uploadPromises);
  }

  /**
   * Delete a single asset from Cloudinary by public_id
   * @param {string} publicId - Cloudinary asset public_id
   * @param {string} resourceType - 'image' | 'video' | 'raw'
   */
  async deleteAsset(publicId, resourceType = 'image') {
    if (!publicId || !this.isConfigured()) return null;

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      return result;
    } catch (error) {
      console.error(`Failed to delete Cloudinary asset (${publicId}):`, error.message);
      return null;
    }
  }

  /**
   * Delete multiple assets from Cloudinary
   * @param {Array<string>} publicIds - Array of public_ids
   * @param {string} resourceType - 'image' | 'video'
   */
  async deleteMultipleAssets(publicIds = [], resourceType = 'image') {
    if (!publicIds || publicIds.length === 0 || !this.isConfigured()) return;

    try {
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });
    } catch (error) {
      console.error('Failed to delete multiple Cloudinary assets:', error.message);
    }
  }
}

export const uploadService = new UploadService();
