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

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&auto=format';

/**
 * Robustly extract a valid image URL string from any image data source
 * (Array of image objects, single object, string, or fallback)
 * @param {Array|Object|string} imgSource
 * @returns {string} Image URL
 */
export const getProductImageUrl = (imgSource) => {
  if (!imgSource) return DEFAULT_FALLBACK_IMAGE;

  // If passed an array of images (e.g. product.images)
  if (Array.isArray(imgSource)) {
    if (imgSource.length === 0) return DEFAULT_FALLBACK_IMAGE;
    const primary = imgSource.find((i) => i && i.isPrimary) || imgSource[0];
    return getProductImageUrl(primary);
  }

  // If passed a single object (e.g. { url: '...' })
  if (typeof imgSource === 'object' && imgSource !== null) {
    if (imgSource.url && typeof imgSource.url === 'string') {
      return imgSource.url;
    }
    return DEFAULT_FALLBACK_IMAGE;
  }

  // If passed a string
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
