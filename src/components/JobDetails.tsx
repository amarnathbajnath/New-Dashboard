import React from 'react';
import { User, Calendar, Hash } from 'lucide-react';
import { JobQuote } from '../types';

interface JobDetailsProps {
  quote: JobQuote;
  onChange: (fields: Partial<JobQuote>) => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ quote, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-slate-200">
        <User className="w-4 h-4 text-blue-400" />
        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
          Job Details
        </h2>
      </div>

      {/* Inputs */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
            Customer Name
          </label>
          <input
            type="text"
            value={quote.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="e.g. John Smith"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
            Address
          </label>
          <input
            type="text"
            value={quote.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="e.g. 123 Main Road"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={quote.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
              Quote No.
            </label>
            <div className="relative">
              <input
                type="text"
                value={quote.quoteNo}
                onChange={(e) => onChange({ quoteNo: e.target.value })}
                placeholder="Q-2026-001"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono transition"
              />
              <Hash className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
