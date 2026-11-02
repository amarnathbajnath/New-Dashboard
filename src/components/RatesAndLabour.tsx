import React from 'react';
import { Settings2, Percent, DollarSign } from 'lucide-react';
import { JobQuote } from '../types';

interface RatesAndLabourProps {
  quote: JobQuote;
  onChange: (fields: Partial<JobQuote>) => void;
}

export const RatesAndLabour: React.FC<RatesAndLabourProps> = ({ quote, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-slate-200">
        <Settings2 className="w-4 h-4 text-blue-400" />
        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
          Rates & Labour
        </h2>
      </div>

      {/* Inputs */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Markup % */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
              Markup %
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={quote.markupPercent}
                onChange={(e) => onChange({ markupPercent: parseFloat(e.target.value) || 0 })}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono transition"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                %
              </span>
            </div>
          </div>

          {/* VAT % */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
              Vat %
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={quote.vatPercent}
                onChange={(e) => onChange({ vatPercent: parseFloat(e.target.value) || 0 })}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono transition"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Labour (TTD) */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
              Labour ({quote.currencyCode || 'TTD'})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 pointer-events-none">
                {quote.currencySymbol || '$'}
              </span>
              <input
                type="number"
                step="10"
                min="0"
                value={quote.labourCost || ''}
                placeholder="0.00"
                onChange={(e) => onChange({ labourCost: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono transition"
              />
            </div>
          </div>

          {/* Inspection (TTD) */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
              Inspection ({quote.currencyCode || 'TTD'})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 pointer-events-none">
                {quote.currencySymbol || '$'}
              </span>
              <input
                type="number"
                step="10"
                min="0"
                value={quote.inspectionCost || ''}
                placeholder="0.00"
                onChange={(e) => onChange({ inspectionCost: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono transition"
              />
            </div>
          </div>
        </div>

        {/* Small explanation subtext from screenshot */}
        <p className="text-[11px] text-slate-400 text-center sm:text-left pt-1">
          Labour &amp; Inspection added to final total without markup/VAT.
        </p>
      </div>
    </div>
  );
};
