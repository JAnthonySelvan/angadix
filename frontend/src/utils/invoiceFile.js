/**
 * Trigger client-side PDF download from a Blob
 * @param {Blob} blob - Raw PDF blob
 * @param {string} orderNumber - Order reference number
 */
export const triggerInvoiceDownload = (blob, orderNumber) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${orderNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Open PDF Blob in a new tab and trigger browser print dialog
 * @param {Blob} blob - Raw PDF blob
 */
export const triggerInvoicePrint = (blob) => {
  const url = window.URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  }
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};
