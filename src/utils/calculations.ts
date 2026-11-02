import { JobQuote } from '../types';

export interface QuoteTotals {
  materialsSubtotal: number;
  markupAmount: number;
  vatAmount: number;
  labourCost: number;
  inspectionCost: number;
  total: number;
}

export function calculateQuoteTotals(quote: JobQuote): QuoteTotals {
  let materialsSubtotal = 0;

  if (quote.sections && Array.isArray(quote.sections)) {
    for (const section of quote.sections) {
      if (section.items && Array.isArray(section.items)) {
        for (const item of section.items) {
          const qty = Number(item.quantity) || 0;
          const cost = Number(item.unitCost) || 0;
          materialsSubtotal += qty * cost;
        }
      }
    }
  }

  const markupPercent = Number(quote.markupPercent) || 0;
  const vatPercent = Number(quote.vatPercent) || 0;
  const labourCost = Number(quote.labourCost) || 0;
  const inspectionCost = Number(quote.inspectionCost) || 0;

  // Markup applied to materials subtotal
  const markupAmount = materialsSubtotal * (markupPercent / 100);

  // VAT applied to materials + markup
  const vatAmount = (materialsSubtotal + markupAmount) * (vatPercent / 100);

  // Labour & Inspection added to final total without markup/VAT (as stated in screenshot)
  const total = materialsSubtotal + markupAmount + vatAmount + labourCost + inspectionCost;

  return {
    materialsSubtotal,
    markupAmount,
    vatAmount,
    labourCost,
    inspectionCost,
    total,
  };
}

export function formatCurrency(amount: number, symbol = '$'): string {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateNextQuoteNo(existingQuotes: JobQuote[] = []): string {
  const currentYear = new Date().getFullYear();
  const prefix = `Q-${currentYear}-`;
  let maxNum = 0;

  for (const q of existingQuotes) {
    if (q.quoteNo && q.quoteNo.startsWith(prefix)) {
      const numPart = parseInt(q.quoteNo.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

export function generateCsvContent(quote: JobQuote): string {
  const totals = calculateQuoteTotals(quote);
  const rows: string[][] = [];

  // Quote Metadata Header
  rows.push(['RISHA VISHAL ELECTRICAL - JOB ESTIMATE & COSTING']);
  rows.push(['Quote Number', quote.quoteNo]);
  rows.push(['Date', quote.date]);
  rows.push(['Customer Name', `"${(quote.customerName || '').replace(/"/g, '""')}"`]);
  rows.push(['Address', `"${(quote.address || '').replace(/"/g, '""')}"`]);
  if (quote.phone) rows.push(['Phone', quote.phone]);
  if (quote.email) rows.push(['Email', quote.email]);
  rows.push([]);

  // Materials Breakdown
  rows.push(['Section', 'SKU', 'Description', 'Quantity', 'Unit', 'Unit Cost (TTD)', 'Line Total (TTD)']);

  quote.sections.forEach((sec) => {
    sec.items.forEach((item) => {
      const lineTotal = (item.quantity || 0) * (item.unitCost || 0);
      rows.push([
        `"${sec.name.replace(/"/g, '""')}"`,
        item.sku || '',
        `"${item.description.replace(/"/g, '""')}"`,
        String(item.quantity),
        item.unit,
        (item.unitCost || 0).toFixed(2),
        lineTotal.toFixed(2),
      ]);
    });
  });

  rows.push([]);
  // Rates & Summary
  rows.push(['FINANCIAL SUMMARY', 'AMOUNT (TTD)']);
  rows.push(['Materials Subtotal', totals.materialsSubtotal.toFixed(2)]);
  rows.push([`Markup (${quote.markupPercent}%)`, totals.markupAmount.toFixed(2)]);
  rows.push([`VAT (${quote.vatPercent}%)`, totals.vatAmount.toFixed(2)]);
  rows.push(['Labour', totals.labourCost.toFixed(2)]);
  rows.push(['Inspection', totals.inspectionCost.toFixed(2)]);
  rows.push(['TOTAL', totals.total.toFixed(2)]);

  if (quote.notes) {
    rows.push([]);
    rows.push(['JOB NOTES']);
    rows.push([`"${quote.notes.replace(/"/g, '""')}"`]);
  }

  return rows.map((r) => r.join(',')).join('\r\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
