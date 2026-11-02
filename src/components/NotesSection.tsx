import React from 'react';
import { FileText } from 'lucide-react';

interface NotesSectionProps {
  notes: string;
  onChange: (notes: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes, onChange }) => {
  return (
    <div className="space-y-3 pt-4 border-t border-[#1c2a44]">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-200">
        <FileText className="w-4 h-4 text-blue-400" />
        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
          Notes
        </h2>
      </div>

      {/* Textarea */}
      <div>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Additional notes for this job..."
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] dark:bg-[#0a0f1d] border border-[#223354] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition resize-y min-h-[90px]"
        />
      </div>
    </div>
  );
};
