import React from 'react';
import { Plus, FileText, Download, TrendingUp } from 'lucide-react';
import { QuoteTotals, formatCurrency } from '../utils/calculations';

interface EstimateSummaryProps {
  totals: QuoteTotals;
  markupPercent: number;
  vatPercent: number;
  currencySymbol: string;
  onAddSection: () => void;
  onGeneratePdf: () => void;
  onExportCsv: () => void;
}

export const EstimateSummary: React.FC<EstimateSummaryProps> = ({
  totals,
  markupPercent,
  vatPercent,
  currencySymbol,
  onAddSection,
  onGeneratePdf,
  onExportCsv,
}) => {
  return (
    <div className="space-y-4">
      {/* Estimate Summary Card matching screenshot */}
      <div className="rounded-2xl border border-blue-500/40 bg-[#0c1527] p-5 shadow-lg shadow-blue-950/40 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <h3 className="text-center font-bold tracking-wider text-white text-sm uppercase mb-5">
          Estimate Summary
        </h3>

        <div className="space-y-3 text-xs">
          {/* Materials Subtotal */}
          <div className="flex items-center justify-between text-slate-300">
            <span>Materials Subtotal</span>
            <span className="font-mono text-slate-100 font-semibold">
              {formatCurrency(totals.materialsSubtotal, currencySymbol)}
            </span>
          </div>

          {/* Markup */}
          <div className="flex items-center justify-between text-slate-300">
            <span>Markup ({markupPercent}%)</span>
            <span className="font-mono text-slate-100 font-semibold">
              {formatCurrency(totals.markupAmount, currencySymbol)}
            </span>
          </div>

          {/* VAT */}
          <div className="flex items-center justify-between text-slate-300">
            <span>VAT ({vatPercent}%)</span>
            <span className="font-mono text-slate-100 font-semibold">
              {formatCurrency(totals.vatAmount, currencySymbol)}
            </span>
          </div>

          {/* Separator */}
          <div className="border-t border-[#1c2c48] my-2" />

          {/* Labour */}
          <div className="flex items-center justify-between text-slate-300">
            <span>Labour</span>
            <span className="font-mono text-slate-100 font-semibold">
              {formatCurrency(totals.labourCost, currencySymbol)}
            </span>
          </div>

          {/* Inspection */}
          <div className="flex items-center justify-between text-slate-300">
            <span>Inspection</span>
            <span className="font-mono text-slate-100 font-semibold">
              {formatCurrency(totals.inspectionCost, currencySymbol)}
            </span>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-[#223558] my-3" />

          {/* TOTAL */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-emerald-400 font-extrabold text-sm tracking-wider uppercase">
              Total
            </span>
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400 tracking-tight">
              {formatCurrency(totals.total, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons matching screenshot exactly */}
      <div className="space-y-3">
        {/* ADD SECTION BUTTON */}
        <button
          onClick={onAddSection}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#101b30] hover:bg-[#162440] text-slate-200 border border-[#223354] transition cursor-pointer active:scale-[0.99] shadow-sm"
        >
          <Plus className="w-4 h-4 text-slate-300" />
          <span>Add Section</span>
        </button>

        {/* GENERATE PDF BUTTON */}
        <button
          onClick={onGeneratePdf}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#3b82f6] hover:bg-blue-600 text-white transition cursor-pointer active:scale-[0.99] shadow-md shadow-blue-500/20"
        >
          <FileText className="w-4 h-4" />
          <span>Generate PDF</span>
        </button>

        {/* EXPORT CSV BUTTON */}
        <button
          onClick={onExportCsv}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#101b30] hover:bg-[#162440] text-slate-200 border border-[#223354] transition cursor-pointer active:scale-[0.99] shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-300" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
};
