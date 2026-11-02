import React, { useState, useRef } from 'react';
import { 
  FolderOpen, 
  Trash2, 
  Download, 
  Upload, 
  X, 
  Copy, 
  Calendar, 
  User, 
  Hash, 
  Check, 
  DollarSign 
} from 'lucide-react';
import { JobQuote } from '../types';
import { calculateQuoteTotals, formatCurrency, downloadFile } from '../utils/calculations';

interface LoadQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: JobQuote[];
  activeQuoteId: string;
  onSelectQuote: (quote: JobQuote) => void;
  onDeleteQuote: (id: string) => void;
  onImportQuote: (quote: JobQuote) => void;
}

export const LoadQuotesModal: React.FC<LoadQuotesModalProps> = ({
  isOpen,
  onClose,
  quotes,
  activeQuoteId,
  onSelectQuote,
  onDeleteQuote,
  onImportQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      (q.customerName || '').toLowerCase().includes(term) ||
      (q.quoteNo || '').toLowerCase().includes(term) ||
      (q.address || '').toLowerCase().includes(term)
    );
  });

  const handleExportJson = (quote: JobQuote) => {
    const jsonStr = JSON.stringify(quote, null, 2);
    downloadFile(jsonStr, `Quote-${quote.quoteNo || 'export'}.json`, 'application/json');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.sections || parsed.quoteNo)) {
          onImportQuote(parsed);
          alert(`Successfully imported quote: ${parsed.quoteNo || 'Imported'}`);
        } else {
          alert('Invalid quote file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-[#233554] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a1020] border-b border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Saved Quotes &amp; Estimates Library
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#142038] hover:bg-[#1e2d4d] text-blue-300 border border-blue-500/30 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 bg-[#0c1527] border-b border-[#1e2d4a]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, quote #, or address..."
            className="w-full px-3.5 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* List of Quotes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredQuotes.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No saved quotes found matching your search.
            </div>
          ) : (
            filteredQuotes.map((q) => {
              const totals = calculateQuoteTotals(q);
              const isActive = q.id === activeQuoteId || q.quoteNo === activeQuoteId;

              return (
                <div
                  key={q.id || q.quoteNo}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-950/40 border-blue-500/50'
                      : 'bg-[#111c33] border-[#1e2f50] hover:border-[#2a3f6a]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {q.quoteNo || 'Draft'}
                      </span>
                      <span className="font-bold text-sm text-slate-100">
                        {q.customerName || 'Unnamed Customer'}
                      </span>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                      <span>{q.address || 'No address specified'}</span>
                      <span>•</span>
                      <span>Date: {q.date || 'N/A'}</span>
                      <span>•</span>
                      <span>{q.sections?.length || 0} section(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c2c48]">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Total
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        {formatCurrency(totals.total, q.currencySymbol)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectQuote(q);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition active:scale-95"
                      >
                        {isActive ? 'Current' : 'Open'}
                      </button>

                      <button
                        onClick={() => handleExportJson(q)}
                        title="Export JSON"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-[#142038] hover:bg-[#1a2c4e] border border-[#223558] transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {quotes.length > 1 && (
                        <button
                          onClick={() => onDeleteQuote(q.id || q.quoteNo)}
                          title="Delete quote"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-[#142038] hover:bg-rose-500/10 border border-[#223558] transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
