import React from 'react';
import { Printer, X, Zap, FileCode } from 'lucide-react';
import { CompanySettings, JobQuote } from '../types';
import { calculateQuoteTotals, formatCurrency } from '../utils/calculations';

interface PdfPreviewModalProps {
  quote: JobQuote;
  company: CompanySettings;
  isOpen: boolean;
  onClose: () => void;
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  quote,
  company,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const totals = calculateQuoteTotals(quote);
  const symbol = quote.currencySymbol || '$';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quote ${escapeHtml(quote.quoteNo)} - ${escapeHtml(company.companyName)}</title>
  <style>
    @page { size: auto; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 32px; color: #1e293b; line-height: 1.5; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .company-title { font-size: 22px; font-weight: 800; color: #0f172a; }
    .quote-title { font-size: 16px; font-weight: 700; color: #1e40af; background: #dbeafe; padding: 4px 12px; border-radius: 6px; display: inline-block; text-transform: uppercase; }
    .grid { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; width: 49%; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; break-inside: avoid; }
    th { background: #0f172a; color: white; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .sec-header { background: #eff6ff; font-weight: bold; color: #1e3a8a; }
    .summary-wrap { display: flex; justify-content: flex-end; margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid; }
    .summary-table { width: 320px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 0; }
    .summary-table td { padding: 6px 12px; }
    .total-row { font-size: 16px; font-weight: bold; background: #ecfdf5; color: #047857; }
    .avoid-break { page-break-inside: avoid; break-inside: avoid; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
    @media print {
      body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-title">⚡ ${escapeHtml(company.companyName)}</div>
      <div style="font-size: 12px; color: #1d4ed8; font-weight: 600;">${escapeHtml(company.subtitle)}</div>
      <div style="font-size: 12px; margin-top: 6px; color: #475569;">${escapeHtml(company.address)}</div>
      <div style="font-size: 12px; color: #475569;">Tel: ${escapeHtml(company.phone)} | ${escapeHtml(company.email)}</div>
      <div style="font-size: 11px; color: #334155; font-weight: 600;">Tax/VAT Reg: ${escapeHtml(company.taxRegistrationNo)}</div>
    </div>
    <div style="text-align: right;">
      <div class="quote-title">Estimate / Quotation</div>
      <div style="font-size: 14px; font-weight: bold; margin-top: 8px;">No: ${escapeHtml(quote.quoteNo)}</div>
      <div style="font-size: 13px; color: #64748b;">Date: ${escapeHtml(quote.date)}</div>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Prepared For</div>
      <div style="font-size: 15px; font-weight: bold; margin-top: 4px;">${escapeHtml(quote.customerName || 'Valued Customer')}</div>
      <div style="font-size: 12px; color: #475569;">${escapeHtml(quote.address || 'Site Location')}</div>
    </div>
    <div class="box">
      <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Pricing Terms</div>
      <div style="font-size: 12px; margin-top: 4px;">Markup Rate: <strong>${quote.markupPercent}%</strong></div>
      <div style="font-size: 12px;">VAT Applicable: <strong>${quote.vatPercent}%</strong></div>
      <div style="font-size: 12px;">Currency: <strong>${escapeHtml(quote.currencyCode || 'TTD')} (${escapeHtml(symbol)})</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>SKU</th>
        <th style="text-align: center;">Qty</th>
        <th>Unit</th>
        <th style="text-align: right;">Unit Cost</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${quote.sections.map(sec => `
        <tr class="sec-header"><td colspan="6">${escapeHtml(sec.name)}</td></tr>
        ${sec.items.map(item => `
          <tr>
            <td>${escapeHtml(item.description)}</td>
            <td style="font-family: monospace; font-size: 11px; color: #64748b;">${escapeHtml(item.sku || '-')}</td>
            <td style="text-align: center; font-family: monospace;">${item.quantity}</td>
            <td>${escapeHtml(item.unit)}</td>
            <td style="text-align: right; font-family: monospace;">${escapeHtml(formatCurrency(item.unitCost, symbol))}</td>
            <td style="text-align: right; font-weight: bold; font-family: monospace;">${escapeHtml(formatCurrency((Number(item.quantity) || 0) * (Number(item.unitCost) || 0), symbol))}</td>
          </tr>
        `).join('')}
      `).join('')}
    </tbody>
  </table>

  <div class="summary-wrap">
    <table class="summary-table">
      <tr><td>Materials Subtotal:</td><td style="text-align: right; font-family: monospace;">${escapeHtml(formatCurrency(totals.materialsSubtotal, symbol))}</td></tr>
      <tr><td>Markup (${quote.markupPercent}%):</td><td style="text-align: right; font-family: monospace;">${escapeHtml(formatCurrency(totals.markupAmount, symbol))}</td></tr>
      <tr><td>VAT (${quote.vatPercent}%):</td><td style="text-align: right; font-family: monospace;">${escapeHtml(formatCurrency(totals.vatAmount, symbol))}</td></tr>
      <tr><td>Labour:</td><td style="text-align: right; font-family: monospace;">${escapeHtml(formatCurrency(totals.labourCost, symbol))}</td></tr>
      <tr><td>Inspection:</td><td style="text-align: right; font-family: monospace;">${escapeHtml(formatCurrency(totals.inspectionCost, symbol))}</td></tr>
      <tr class="total-row"><td>TOTAL (${escapeHtml(quote.currencyCode || 'TTD')}):</td><td style="text-align: right; font-family: monospace;">${escapeHtml(formatCurrency(totals.total, symbol))}</td></tr>
    </table>
  </div>

  ${quote.notes ? `
    <div class="avoid-break" style="margin-top: 16px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px;">
      <strong>Scope of Work / Job Notes:</strong>
      <p style="margin: 4px 0 0 0; white-space: pre-line;">${escapeHtml(quote.notes)}</p>
    </div>
  ` : ''}

  <div class="footer avoid-break">
    <p>This quotation is generated by ${escapeHtml(company.companyName)}. Valid for 30 days from date of issue. To accept this proposal, please sign and return.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estimate-${quote.quoteNo || 'Electrical'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:static print:inset-auto print:block print:p-0 print:m-0 print:bg-white print:overflow-visible print:backdrop-blur-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto text-slate-100 print:static print:block print:w-full print:max-w-none print:max-h-none print:h-auto print:overflow-visible print:bg-white print:text-slate-900 print:border-0 print:rounded-none print:shadow-none print:m-0">
        {/* Modal Toolbar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm tracking-wide">
              Printable PDF &amp; Document Preview
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              {quote.quoteNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              title="Download standalone HTML quotation (works on GitHub static site)"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export HTML</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container (Styled like clean white document) */}
        <div className="p-6 overflow-y-auto bg-slate-800/50 print:p-0 print:m-0 print:overflow-visible print:bg-white">
          <div
            id="printable-quote"
            className="bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-lg max-w-3xl mx-auto text-xs leading-normal print:rounded-none print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0"
          >
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-5 mb-6 print-avoid-break">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">
                      {company.companyName}
                    </h1>
                    <p className="text-[11px] font-semibold text-blue-700">
                      {company.subtitle}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-600 space-y-0.5">
                  <p>{company.address}</p>
                  <p>Tel: {company.phone} | Email: {company.email}</p>
                  <p className="font-semibold text-slate-700">Tax / VAT Reg: {company.taxRegistrationNo}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-extrabold text-sm rounded uppercase tracking-wider">
                  Estimate / Quotation
                </span>
                <div className="mt-3 space-y-1">
                  <p className="text-xs">
                    <span className="text-slate-500">Quote #:</span>{' '}
                    <span className="font-mono font-bold text-slate-900">{quote.quoteNo}</span>
                  </p>
                  <p className="text-xs">
                    <span className="text-slate-500">Date:</span>{' '}
                    <span className="font-medium text-slate-900">{quote.date}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Client & Project Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 print-avoid-break">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Prepared For:
                </span>
                <p className="text-sm font-bold text-slate-900">{quote.customerName || 'Valued Customer'}</p>
                <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-line">{quote.address || 'Site Location'}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Pricing Terms:
                </span>
                <p className="text-xs text-slate-700">
                  Markup Rate: <strong className="text-slate-900">{quote.markupPercent}%</strong>
                </p>
                <p className="text-xs text-slate-700">
                  VAT Applicable: <strong className="text-slate-900">{quote.vatPercent}%</strong>
                </p>
                <p className="text-xs text-slate-700">
                  Currency: <strong className="text-slate-900">{quote.currencyCode || 'TTD'} ({symbol})</strong>
                </p>
              </div>
            </div>

            {/* Itemized Materials Table */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b pb-1">
                Bill of Quantities &amp; Materials Breakdown
              </h2>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-2">Description</th>
                    <th className="p-2 w-20">SKU</th>
                    <th className="p-2 w-16 text-center">Qty</th>
                    <th className="p-2 w-16">Unit</th>
                    <th className="p-2 w-24 text-right">Unit Price</th>
                    <th className="p-2 w-24 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {quote.sections.map((section) => (
                    <React.Fragment key={section.id}>
                      <tr className="bg-blue-50/70 font-bold text-blue-900 text-[11px]">
                        <td colSpan={6} className="p-2 pl-3">
                          {section.name}
                        </td>
                      </tr>
                      {section.items.map((item) => {
                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-2 pl-4 text-slate-900">{item.description}</td>
                            <td className="p-2 font-mono text-[10px] text-slate-500">{item.sku || '-'}</td>
                            <td className="p-2 text-center font-mono">{item.quantity}</td>
                            <td className="p-2 text-slate-600">{item.unit}</td>
                            <td className="p-2 text-right font-mono text-slate-700">
                              {formatCurrency(item.unitCost, symbol)}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(lineTotal, symbol)}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Totals Box */}
            <div className="flex justify-end mb-6 print-avoid-break">
              <div className="w-72 bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Materials Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(totals.materialsSubtotal, symbol)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Markup ({quote.markupPercent}%):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(totals.markupAmount, symbol)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT ({quote.vatPercent}%):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(totals.vatAmount, symbol)}
                  </span>
                </div>
                <div className="border-t border-slate-200 my-1" />
                <div className="flex justify-between text-slate-600">
                  <span>Labour:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(totals.labourCost, symbol)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Inspection:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(totals.inspectionCost, symbol)}
                  </span>
                </div>
                <div className="border-t-2 border-slate-300 pt-1.5 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>TOTAL ({quote.currencyCode || 'TTD'}):</span>
                  <span className="font-mono text-base font-extrabold text-blue-700">
                    {formatCurrency(totals.total, symbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] mb-6 print-avoid-break">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Scope of Work / Job Notes:
                </span>
                <p className="text-slate-600 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}

            {/* Authorization Signatures */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px] text-slate-600 print-avoid-break">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                  Prepared By: {company.companyName}
                </div>
                <p>Authorized Contractor Representative</p>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                  Customer Acceptance Signature
                </div>
                <p>Sign &amp; Date to accept this estimate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
