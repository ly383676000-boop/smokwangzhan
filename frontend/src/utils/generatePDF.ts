import jsPDF from 'jspdf';
import { CartItem, CustomerInfo } from '../types';

interface GeneratePDFParams {
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  language?: 'en' | 'zh';
}

const formatVariant = (item: CartItem, lang: 'en' | 'zh'): string => {
  const v = item.variants;
  const parts: string[] = [];
  
  if (v.color) parts.push(`Color: ${v.color}`);
  if (v.size) parts.push(`Size: ${v.size}`);
  if (v.specification) parts.push(`Spec: ${v.specification}`);
  if (v.material) parts.push(`Material: ${v.material}`);
  
  if (v.custom1?.value) parts.push(`${v.custom1.name}: ${v.custom1.value}`);
  if (v.custom2?.value) parts.push(`${v.custom2.name}: ${v.custom2.value}`);
  if (v.custom3?.value) parts.push(`${v.custom3.name}: ${v.custom3.value}`);
  if (v.notes) parts.push(`Notes: ${v.notes}`);
  
  return parts.join('\n');
};

export const generateOrderPDF = ({
  items,
  customer,
  total,
  language = 'en',
}: GeneratePDFParams): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Colors - Updated to match new design
  const primaryColor: [number, number, number] = [27, 67, 50]; // #1B4332 - Deep Green
  const accentColor: [number, number, number] = [255, 140, 0]; // #FF8C00 - Orange
  const textColor: [number, number, number] = [51, 51, 51]; // #333333
  const lightGray: [number, number, number] = [248, 249, 250]; // #F8F9FA

  // Background
  doc.setFillColor(...lightGray);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Header - Company Name with green background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const companyName = 'HONG KONG COOKIES TRADING LIMITED';
  doc.text(companyName, pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Premium Smoking Accessories & Glass Pipes', pageWidth / 2, 25, { align: 'center' });
  
  yPos = 50;

  // Divider line
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // Order Date with icon
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  const orderDate = new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`📅 ${language === 'en' ? 'Order Date' : '订单日期'}: ${orderDate}`, margin, yPos);
  
  // Order number
  const orderNum = `ORD-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`${language === 'en' ? 'Order' : '订单'} #: ${orderNum}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 15;

  // Customer Information Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('👤 ' + (language === 'en' ? 'Customer Information' : '客户信息'), margin + 5, yPos + 8);
  yPos += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  const customerFields = [
    { 
      label: language === 'en' ? 'Name' : '姓名', 
      value: customer.name,
      x: margin + 5
    },
    { 
      label: language === 'en' ? 'Email' : '邮箱', 
      value: customer.email || '-',
      x: pageWidth / 2
    },
    { 
      label: language === 'en' ? 'Phone' : '电话', 
      value: customer.phone,
      x: margin + 5
    },
    { 
      label: language === 'en' ? 'Country' : '国家', 
      value: customer.country || '-',
      x: pageWidth / 2
    },
  ];

  // First row
  doc.setFont('helvetica', 'bold');
  doc.text(`${customerFields[0].label}:`, customerFields[0].x, yPos);
  doc.text(`${customerFields[1].label}:`, customerFields[1].x, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(customerFields[0].value, customerFields[0].x, yPos + 5);
  doc.text(customerFields[1].value, customerFields[1].x, yPos + 5);
  
  yPos += 12;
  
  // Second row
  doc.setFont('helvetica', 'bold');
  doc.text(`${customerFields[2].label}:`, customerFields[2].x, yPos);
  doc.text(`${customerFields[3].label}:`, customerFields[3].x, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(customerFields[2].value, customerFields[2].x, yPos + 5);
  doc.text(customerFields[3].value, customerFields[3].x, yPos + 5);

  yPos += 22;

  // Address
  if (customer.address) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${language === 'en' ? 'Address' : '地址'}:`, margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    const addressText = [customer.address, customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ');
    doc.text(addressText, margin + 5, yPos + 5);
    yPos += 12;
  }

  yPos += 10;

  // Products Table Header
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  
  const colWidths = [60, 22, 48, 12, 20, 20];
  const headers = [
    language === 'en' ? 'Product' : '产品',
    language === 'en' ? 'SKU' : 'SKU',
    language === 'en' ? 'Variant' : '变体',
    language === 'en' ? 'Qty' : '数量',
    language === 'en' ? 'Price' : '单价',
    language === 'en' ? 'Total' : '小计',
  ];
  
  let xPos = margin + 3;
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos + 7);
    xPos += colWidths[i];
  });
  yPos += 12;

  // Products Table Body
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  items.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
      // Add header on new page
      doc.setFillColor(...primaryColor);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, 'F');
      xPos = margin + 3;
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos + 7);
        xPos += colWidths[i];
      });
      yPos += 12;
      doc.setTextColor(...textColor);
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPos - 4, pageWidth - margin * 2, 18, 'F');
    }

    xPos = margin + 3;
    doc.setTextColor(...textColor);
    
    // Product name
    const productName = language === 'en' ? item.product.nameEn : item.product.name;
    const nameLines = doc.splitTextToSize(productName, colWidths[0] - 5);
    doc.text(nameLines[0], xPos, yPos + 3);
    xPos += colWidths[0];

    // SKU
    doc.setTextColor(102, 102, 102);
    doc.text(item.product.sku, xPos, yPos + 3);
    xPos += colWidths[1];
    doc.setTextColor(...textColor);

    // Variant
    const variantText = formatVariant(item, language);
    const variantLines = doc.splitTextToSize(variantText, colWidths[2] - 5);
    doc.text(variantLines[0], xPos, yPos + 3);
    xPos += colWidths[2];

    // Quantity
    doc.text(item.quantity.toString(), xPos, yPos + 3);
    xPos += colWidths[3];

    // Price
    doc.text(`$${item.price.toFixed(2)}`, xPos, yPos + 3);
    xPos += colWidths[4];

    // Total
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, xPos, yPos + 3);
    doc.setFont('helvetica', 'normal');
    
    yPos += 16;

    // Row divider
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
  });

  yPos += 8;

  // Total Section
  doc.setFillColor(...primaryColor);
  doc.roundedRect(pageWidth - margin - 80, yPos, 80, 20, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${language === 'en' ? 'TOTAL' : '总计'}: $${total.toFixed(2)}`, pageWidth - margin - 5, yPos + 13, { align: 'right' });

  yPos += 30;

  // Thank you message
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(
    '✨ ' + (language === 'en' ? 'Thank you for your order!' : '感谢您的订单！') + ' ✨',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text(
    language === 'en' 
      ? 'We will contact you shortly with shipping information.'
      : '我们将尽快与您联系，提供发货信息。',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(...primaryColor);
  doc.rect(0, yPos - 8, pageWidth, 20, 'F');
  
  yPos = doc.internal.pageSize.getHeight() - 3;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(
    'HONG KONG COOKIES TRADING LIMITED | Premium Smoking Accessories',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  // Save
  const fileName = `HKC_Order_${orderNum}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};
