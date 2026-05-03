import jsPDF from 'jspdf';
import { CartItem, CustomerInfo } from '../types';

interface GeneratePDFParams {
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  originalTotal?: number;
  language?: 'en' | 'zh';
  companyName?: string;
}

/** Load image as base64 data URL (async), resized to fit PDF at specified DPI */
const loadImageAsDataUrl = (url: string, targetWidthMm: number, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const dpi = 150;
      const pxWidth = Math.round((targetWidthMm / 25.4) * dpi);
      const aspect = img.naturalHeight / img.naturalWidth;
      const pxHeight = Math.round(pxWidth * aspect);
      const canvas = document.createElement('canvas');
      canvas.width = pxWidth;
      canvas.height = pxHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context failed')); return; }
      ctx.drawImage(img, 0, 0, pxWidth, pxHeight);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
};

export const generateOrderPDF = async ({
  items,
  customer,
  total,
  originalTotal,
  language = 'en',
  companyName,
}: GeneratePDFParams): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Colors
  const darkColor: [number, number, number] = [27, 67, 50]; // #1B4332
  const mediumGray: [number, number, number] = [100, 100, 100];
  const lightGray: [number, number, number] = [240, 240, 240];
  const borderColor: [number, number, number] = [200, 200, 200];

  // ── Logo + INVOICE Title ──
  const logoWidth = 32;
  const logoHeight = 16;
  let logoLoaded = false;

  try {
    const logoDataUrl = await loadImageAsDataUrl('/logo_invoice.png', logoWidth);
    doc.addImage(logoDataUrl, 'JPEG', margin, yPos, logoWidth, logoHeight);
    logoLoaded = true;
  } catch {
    // Logo load failed, continue without it
  }

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('INVOICE', pageWidth - margin, yPos + 10, { align: 'right' });
  yPos += 22;

  // ── Divider ──
  doc.setDrawColor(...darkColor);
  doc.setLineWidth(1.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ── BILLED TO (left) + Date/Invoice No. (right) ──
  const leftX = margin;
  const rightX = pageWidth - margin;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mediumGray);
  doc.text('BILLED TO:', leftX, yPos);

  const orderDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  doc.text('DATE:', rightX - 65, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(orderDate, rightX, yPos, { align: 'right' });
  yPos += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(customer.name.toUpperCase(), leftX, yPos);

  const invoiceNo = `MI${String(Math.floor(Math.random() * 90000) + 10000)}`;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mediumGray);
  doc.text('INVOICE No.:', rightX - 65, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(invoiceNo, rightX, yPos, { align: 'right' });
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  if (customer.address) {
    doc.text(customer.address, leftX, yPos);
    yPos += 5;
  }
  if (customer.country) {
    doc.text(customer.country.toUpperCase(), leftX, yPos);
    yPos += 5;
  }
  if (customer.phone) {
    doc.text('+ ' + customer.phone, leftX, yPos);
    yPos += 5;
  }

  yPos += 10;

  // ── Product Table ──
  // Now includes image column
  const thumbSize = 14; // thumbnail width & height in mm (square)
  const rowHeight = thumbSize + 4; // row height = image + padding
  const imgPad = 2; // padding around image

  const colDefs = [
    { key: 'code',    label: 'Code',           width: 20 },
    { key: 'img',     label: 'Photo',         width: thumbSize + 2 },
    { key: 'product', label: 'Product',        width: 50 },
    { key: 'boxqty',  label: 'Ctn\nQty',       width: 14 },
    { key: 'boxes',   label: 'Ctns',          width: 14 },
    { key: 'qty',     label: 'Total\nUnits',   width: 14 },
    { key: 'price',   label: 'Unit\nPrice',    width: 18 },
    { key: 'total',   label: 'Total\nPrice',   width: 18 },
  ];
  const totalTableWidth = colDefs.reduce((s, c) => s + c.width, 0);

  const drawTableHeader = (y: number) => {
    doc.setFillColor(...darkColor);
    doc.rect(margin, y, totalTableWidth, 14, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    let xPos = margin + 2;
    colDefs.forEach((col) => {
      const lines = col.label.split('\n');
      if (lines.length > 1) {
        doc.text(lines[0], xPos, y + 5);
        doc.text(lines[1], xPos, y + 10);
      } else {
        doc.text(col.label, xPos, y + 9);
      }
      xPos += col.width;
    });

    return y + 14;
  };

  yPos = drawTableHeader(yPos);

  // ── Pre-load product images ──
  const imageDataUrls = new Map<string, string>();
  const imageLoadPromises = items.map(async (item) => {
    const imageUrl = item.product.image || (item.product.images && item.product.images[0]) || '';
    if (!imageUrl) return;
    try {
      const dataUrl = await loadImageAsDataUrl(imageUrl, thumbSize, 0.8);
      imageDataUrls.set(item.id, dataUrl);
    } catch {
      // Image load failed, skip
    }
  });
  await Promise.all(imageLoadPromises);

  // Table body
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  items.forEach((item, index) => {
    // Page break check
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
      yPos = drawTableHeader(yPos);
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(...lightGray);
      doc.rect(margin, yPos, totalTableWidth, rowHeight, 'F');
    }

    // Row border
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + rowHeight, margin + totalTableWidth, yPos + rowHeight);

    let xPos = margin + 2;
    const textRowY = yPos + (rowHeight / 2) + 1; // vertically centered text

    // ── Code ──
    const code = item.product.sku || item.product.brand || '';
    doc.text(code, xPos, textRowY);
    xPos += colDefs[0].width;

    // ── Product Image ──
    const imgData = imageDataUrls.get(item.id);
    if (imgData) {
      try {
        doc.addImage(imgData, 'JPEG', xPos, yPos + imgPad, thumbSize, thumbSize);
      } catch {
        // Failed to add image, draw placeholder
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.rect(xPos, yPos + imgPad, thumbSize, thumbSize);
      }
    } else {
      // No image — draw placeholder box
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.rect(xPos, yPos + imgPad, thumbSize, thumbSize);
    }
    xPos += colDefs[1].width;

    // Product name
    const productName = language === 'en' ? item.product.nameEn : item.product.name;
    const nameLines = doc.splitTextToSize(productName, colDefs[3].width - 4);
    doc.text(nameLines[0], xPos, textRowY);
    // Variant info on second line
    const variantKeys = Object.keys(item.variants).filter(k => k !== 'notes' && item.variants[k]);
    if (variantKeys.length > 0) {
      const variantParts = variantKeys.map(k => item.variants[k]);
      doc.setFontSize(7);
      doc.setTextColor(...mediumGray);
      doc.text('(' + variantParts.join(', ') + ')', xPos, textRowY + 4);
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
    }
    xPos += colDefs[2].width;

    // Box Qty (per box)
    const itemBoxQty = (item as any).boxQty || 1;
    doc.text(String(itemBoxQty), xPos, textRowY);
    xPos += colDefs[3].width;

    // Boxes
    const itemBoxes = (item as any).boxes || Math.ceil(item.quantity / itemBoxQty);
    doc.text(String(itemBoxes), xPos, textRowY);
    xPos += colDefs[4].width;

    // Total Units
    doc.text(String(item.quantity), xPos, textRowY);
    xPos += colDefs[5].width;

    // Unit Price
    doc.text(`$ ${item.price.toFixed(2)}`, xPos, textRowY);
    xPos += colDefs[6].width;

    // Total Price
    doc.setFont('helvetica', 'bold');
    doc.text(`$ ${(item.price * item.quantity).toFixed(2)}`, xPos, textRowY);
    doc.setFont('helvetica', 'normal');

    yPos += rowHeight;
  });

  yPos += 5;

  // ── Totals Section ──
  const subtotal = items.reduce((s, item) => s + item.price * item.quantity, 0);
  const shipping = total - subtotal;
  const rightCol = margin + totalTableWidth;
  const labelX = rightCol - 50;
  const valueX = rightCol;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Subtotal', labelX, yPos);
  doc.text(`$ ${subtotal.toFixed(2)}`, valueX, yPos, { align: 'right' });
  yPos += 7;

  doc.text('Shipping', labelX, yPos);
  doc.text(`$ ${Math.max(0, shipping).toFixed(2)}`, valueX, yPos, { align: 'right' });
  yPos += 2;

  doc.setDrawColor(...darkColor);
  doc.setLineWidth(1);
  doc.line(labelX, yPos, rightCol, yPos);
  yPos += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Total', labelX, yPos);

  if (originalTotal !== undefined && originalTotal !== total) {
    // Original price with strikethrough above, new price clear below
    const origText = `$ ${originalTotal.toFixed(2)}`;
    const newText = `$ ${total.toFixed(2)}`;

    // Original price (strikethrough)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    const origTextWidth = doc.getTextWidth(origText);
    doc.text(origText, valueX, yPos - 6, { align: 'right' });
    // Strikethrough line
    doc.setDrawColor(...mediumGray);
    doc.setLineWidth(0.5);
    doc.line(valueX - origTextWidth, yPos - 7, valueX, yPos - 7);

    // New price (clear, bold, no shadow)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(newText, valueX, yPos, { align: 'right' });
  } else {
    doc.text(`$ ${total.toFixed(2)}`, valueX, yPos, { align: 'right' });
  }

  // ── Footer ──
  const footerY = pageHeight - 15;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mediumGray);
  doc.text(
    companyName || 'HONG KONG COOKIES TRADING LIMITED',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Save
  const fileName = `Invoice_${invoiceNo}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};
