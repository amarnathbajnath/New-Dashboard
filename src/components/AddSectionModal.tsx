import React, { useState } from 'react';
import { Plus, X, Layers, Sparkles } from 'lucide-react';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sectionName: string) => void;
}

const SECTION_PRESETS = [
  'Main Distribution Board & Breakers',
  'Conduit, Wire & Cable',
  'Fixtures & Outlets',
  'Safety, Grounding & Surge Protection',
  'Switches & Lighting Controls',
  'HVAC & Dedicated Motor Circuits',
  'Low Voltage & Network Cabling',
  'Underground / Exterior Trenching & PVC',
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
    onClose();
  };

  const handleSelectPreset = (preset: string) => {
    onAdd(preset);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#233554] rounded-2xl p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-[#1e2d4a]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">Add Material Section</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sub-Panel & Breakers"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm font-medium"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Suggestions
            </span>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {SECTION_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-[#142038] hover:bg-[#1d2d4d] border border-[#223558] text-slate-200 transition flex items-center justify-between group"
                >
                  <span>{preset}</span>
                  <Plus className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1e2d4a] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#1a2846] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition shadow-sm"
            >
              Add Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
