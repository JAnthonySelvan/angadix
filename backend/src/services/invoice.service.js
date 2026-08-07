import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { env } from '../config/env.js';
import { uploadService } from './upload.service.js';

/**
 * Generate a brand-styled PDF Invoice Buffer for a given Order
 * @param {Object} order - Mongoose Order document or plain object
 * @returns {Promise<Buffer>} Resolves to PDF Buffer
 */
export const generateInvoicePdfBuffer = (order) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Brand Palette
      const PRIMARY_COLOR = '#0266C8';
      const SLATE_TEXT = '#1E293B';
      const MUTED_TEXT = '#64748B';
      const LIGHT_BG = '#F8FAFC';
      const BORDER_COLOR = '#E2E8F0';

      const pageWidth = doc.page.width; // ~595.28 pt for A4
      const contentWidth = pageWidth - 80;

      // 1. Header Banner
      doc.rect(40, 40, contentWidth, 70).fill(PRIMARY_COLOR);

      doc
        .fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('ANGADIX', 56, 56);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Premium E-Commerce Platform', 56, 82);

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', 350, 62, { align: 'right', width: contentWidth - 326 });

      doc.y = 125;

      // 2. Invoice & Order Meta Section
      const invoiceNum = `INV-${order.orderNumber || '00000'}`;
      const invoiceDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : new Date().toLocaleDateString('en-IN');

      const metaY = doc.y;
      
      // Left Column: Billing / Shipping Info
      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Billed & Shipped To:', 40, metaY);

      const addr = order.shippingAddress || {};
      doc
        .fillColor(SLATE_TEXT)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(addr.fullName || 'Customer', 40, metaY + 18)
        .font('Helvetica')
        .fillColor(MUTED_TEXT)
        .text(addr.addressLine1 || '', 40, metaY + 32)
        .text(
          `${addr.addressLine2 ? addr.addressLine2 + ', ' : ''}${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`,
          40,
          metaY + 46
        )
        .text(`Phone: ${addr.phone || 'N/A'}`, 40, metaY + 60);

      // Right Column: Order Details
      const rightColX = 320;
      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Invoice Details:', rightColX, metaY);

      doc
        .fillColor(SLATE_TEXT)
        .fontSize(9)
        .font('Helvetica')
        .text(`Invoice No: `, rightColX, metaY + 18, { continued: true })
        .font('Helvetica-Bold')
        .text(invoiceNum)
        .font('Helvetica')
        .text(`Order Ref: `, rightColX, metaY + 32, { continued: true })
        .font('Helvetica-Bold')
        .text(order.orderNumber || 'N/A')
        .font('Helvetica')
        .text(`Invoice Date: ${invoiceDate}`, rightColX, metaY + 46)
        .text(`Payment Method: ${String(order.paymentMethod || 'COD').toUpperCase()}`, rightColX, metaY + 60)
        .text(`Payment Status: ${String(order.paymentStatus || 'pending').toUpperCase()}`, rightColX, metaY + 74);

      doc.y = metaY + 100;

      // 3. Itemized Products Table
      const tableTop = doc.y;
      doc.rect(40, tableTop, contentWidth, 24).fill(PRIMARY_COLOR);

      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Item Description', 50, tableTop + 7)
        .text('Qty', 340, tableTop + 7, { width: 40, align: 'center' })
        .text('Unit Price', 390, tableTop + 7, { width: 70, align: 'right' })
        .text('Total Amount', 470, tableTop + 7, { width: 75, align: 'right' });

      let currentY = tableTop + 24;
      const items = order.items || [];

      items.forEach((item, index) => {
        const bg = index % 2 === 0 ? '#FFFFFF' : LIGHT_BG;
        doc.rect(40, currentY, contentWidth, 24).fill(bg);

        const itemName = item.name || 'Product';
        const price = item.price || 0;
        const qty = item.quantity || 1;
        const lineTotal = item.lineTotal || price * qty;

        doc
          .fillColor(SLATE_TEXT)
          .fontSize(9)
          .font('Helvetica')
          .text(itemName.length > 48 ? itemName.substring(0, 45) + '...' : itemName, 50, currentY + 7)
          .text(String(qty), 340, currentY + 7, { width: 40, align: 'center' })
          .text(`INR ${price.toFixed(2)}`, 390, currentY + 7, { width: 70, align: 'right' })
          .text(`INR ${lineTotal.toFixed(2)}`, 470, currentY + 7, { width: 75, align: 'right' });

        doc
          .rect(40, currentY + 23, contentWidth, 1)
          .fill(BORDER_COLOR);

        currentY += 24;
      });

      // 4. Financial Summary Section
      currentY += 10;
      const summaryX = 330;
      const summaryWidth = 225;

      const subtotal = order.subtotal || 0;
      const discountAmount = order.discountAmount || 0;
      const shippingCharge = order.shippingCharge || 0;
      const taxAmount = order.taxAmount || 0;
      const totalAmount = order.totalAmount || 0;

      const renderSummaryRow = (label, value, isBold = false, isHighlight = false) => {
        if (isHighlight) {
          doc.rect(summaryX - 10, currentY - 2, summaryWidth, 22).fill('#E1F5FE');
        }

        doc
          .fillColor(isHighlight ? PRIMARY_COLOR : SLATE_TEXT)
          .fontSize(isBold ? 10 : 9)
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .text(label, summaryX, currentY + 2);

        doc
          .text(`INR ${value.toFixed(2)}`, 450, currentY + 2, { width: 95, align: 'right' });

        currentY += 20;
      };

      renderSummaryRow('Subtotal:', subtotal);
      if (discountAmount > 0) {
        const couponCode = order.appliedCoupon?.code ? ` (${order.appliedCoupon.code})` : '';
        renderSummaryRow(`Discount${couponCode}:`, -discountAmount);
      }
      renderSummaryRow('Shipping Charge:', shippingCharge);
      renderSummaryRow('Tax Amount (GST):', taxAmount);
      
      // Divider line before Grand Total
      doc.rect(summaryX - 10, currentY, summaryWidth, 1).fill(PRIMARY_COLOR);
      currentY += 4;
      renderSummaryRow('Grand Total:', totalAmount, true, true);

      // 5. Footer & Verification QR Code
      const includeQr = process.env.INCLUDE_INVOICE_QR !== 'false';
      const footerY = 730;

      doc.rect(40, footerY - 10, contentWidth, 1).fill(BORDER_COLOR);

      doc
        .fillColor(MUTED_TEXT)
        .fontSize(8)
        .font('Helvetica')
        .text('Thank you for shopping with Angadix!', 40, footerY)
        .text('This is a system-generated tax invoice. No signature is required.', 40, footerY + 12)
        .text('Support & Inquiries: support@angadix.com | www.angadix.com', 40, footerY + 24);

      if (includeQr) {
        try {
          const clientUrl = env.clientUrl || 'https://angadix.com';
          const verificationUrl = `${clientUrl}/orders/${order._id}`;
          const qrPngBuffer = await QRCode.toBuffer(verificationUrl, {
            margin: 1,
            width: 60,
            color: {
              dark: '#0266C8',
              light: '#FFFFFF',
            },
          });
          doc.image(qrPngBuffer, 485, footerY - 5, { width: 50, height: 50 });
        } catch (qrErr) {
          console.warn('[Invoice Service] QR Code generation skipped due to error:', qrErr.message);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Get cached Cloudinary Invoice PDF URL or generate and upload new PDF
 * @param {Object} order - Mongoose Order document
 * @param {Object} options - { forceRegenerate: boolean }
 * @returns {Promise<{ url: string|null, publicId: string|null, cached: boolean, buffer?: Buffer }>}
 */
export const getOrInvoicePdfUrl = async (order, { forceRegenerate = false } = {}) => {
  // If Cloudinary is configured and a valid invoice URL is cached (and forceRegenerate is false)
  if (
    uploadService.isConfigured() &&
    order.invoice?.url &&
    !forceRegenerate
  ) {
    return {
      url: order.invoice.url,
      publicId: order.invoice.publicId,
      cached: true,
    };
  }

  // Otherwise, generate the PDF Buffer in memory
  const pdfBuffer = await generateInvoicePdfBuffer(order);

  // If Cloudinary is configured, upload / replace asset on Cloudinary and persist on Order
  if (uploadService.isConfigured()) {
    // Delete existing asset first if regenerating
    if (order.invoice?.publicId) {
      await uploadService.deleteAsset(order.invoice.publicId, 'raw');
    }

    const uploadRes = await uploadService.uploadBuffer(pdfBuffer, {
      folder: 'angadix/invoices',
      resource_type: 'raw',
      public_id: `invoice-${order.orderNumber}`,
      format: 'pdf',
    });

    order.invoice = {
      url: uploadRes.url,
      publicId: uploadRes.publicId,
      generatedAt: new Date(),
    };

    // Save order invoice metadata without triggering full validation hooks
    if (typeof order.save === 'function') {
      await order.save({ validateBeforeSave: false });
    }

    return {
      url: uploadRes.url,
      publicId: uploadRes.publicId,
      cached: false,
      buffer: pdfBuffer,
    };
  }

  // Fallback when Cloudinary is not configured: stream PDF directly without Cloudinary persistence
  return {
    url: null,
    publicId: null,
    cached: false,
    buffer: pdfBuffer,
  };
};
