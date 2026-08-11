/**
 * Shared guard check to verify whether an order is eligible for invoice download/printing.
 * Invoices are available when payment status is 'paid' or payment method is 'cod'.
 * @param {Object} order - Order object
 * @returns {boolean}
 */
export const isInvoiceAvailable = (order) => {
  if (!order) return false;
  return order.paymentStatus === 'paid' || order.paymentMethod === 'cod';
};

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&auto=format';

/**
 * Robustly extract raw valid image URL string from any image data source
 * @param {Array|Object|string} imgSource
 * @returns {string} Raw image URL
 */
export const getRawProductImageUrl = (imgSource) => {
  if (!imgSource) return DEFAULT_FALLBACK_IMAGE;

  if (Array.isArray(imgSource)) {
    if (imgSource.length === 0) return DEFAULT_FALLBACK_IMAGE;
    const primary = imgSource.find((i) => i && i.isPrimary) || imgSource[0];
    return getRawProductImageUrl(primary);
  }

  if (typeof imgSource === 'object' && imgSource !== null) {
    if (imgSource.url && typeof imgSource.url === 'string') {
      return imgSource.url;
    }
    return DEFAULT_FALLBACK_IMAGE;
  }

  if (typeof imgSource === 'string') {
    const trimmed = imgSource.trim();
    if (
      !trimmed ||
      trimmed === '[object Object]' ||
      trimmed === 'null' ||
      trimmed === 'undefined' ||
      trimmed.includes('via.placeholder.com')
    ) {
      return DEFAULT_FALLBACK_IMAGE;
    }
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('data:')
    ) {
      return trimmed;
    }
  }

  return DEFAULT_FALLBACK_IMAGE;
};

/**
 * Transforms a Cloudinary URL to remove background using e_background_removal
 * and format as transparent PNG while preserving original aspect ratio.
 * @param {string} url
 * @returns {string} Transformed Cloudinary URL or original URL
 */
export const getCloudinaryBgRemovedUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  // Verify Cloudinary upload URL pattern
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // Avoid duplicating transformation if already applied
    if (url.includes('e_background_removal') || url.includes('e_bgremoval')) {
      return url;
    }

    // Convert file extension to .png to preserve background transparency
    let pngUrl = url.replace(/\.(jpg|jpeg|webp|avif|gif)$/i, '.png');

    // Insert f_png,e_background_removal transformation after /image/upload/
    return pngUrl.replace('/image/upload/', '/image/upload/f_png,e_background_removal/');
  }

  return url;
};

/**
 * Get product image URL with Cloudinary AI background-removal transformation by default.
 * @param {Array|Object|string} imgSource
 * @param {Object} options
 * @param {boolean} options.removeBg - Whether to apply background removal transformation
 * @returns {string} Transformed or raw image URL
 */
export const getProductImageUrl = (imgSource, { removeBg = true } = {}) => {
  const rawUrl = getRawProductImageUrl(imgSource);
  if (removeBg && rawUrl && rawUrl !== DEFAULT_FALLBACK_IMAGE) {
    return getCloudinaryBgRemovedUrl(rawUrl);
  }
  return rawUrl;
};

/**
 * Graceful error handler for product image <img> elements.
 * If Cloudinary AI background-removal transformation fails, falls back to raw original image.
 * If original image fails, falls back to default placeholder.
 * @param {SyntheticEvent} e - Image onError event
 * @param {string} originalRawUrl - Original raw non-transformed image URL
 */
export const handleProductImageError = (e, originalRawUrl) => {
  const target = e.target;
  const currentSrc = target.src || '';

  // If transformed Cloudinary AI background removal failed, fall back to raw original image
  if (
    originalRawUrl &&
    currentSrc !== originalRawUrl &&
    (currentSrc.includes('e_background_removal') || currentSrc.includes('e_bgremoval'))
  ) {
    target.src = originalRawUrl;
    return;
  }

  // Final fallback to default placeholder image
  if (currentSrc !== DEFAULT_FALLBACK_IMAGE) {
    target.src = DEFAULT_FALLBACK_IMAGE;
  }
};

