import React, { useState } from 'react';
import { BookOpen, Search, Plus, Check, X, Layers } from 'lucide-react';
import { COMMON_ELECTRICAL_ITEMS } from '../constants';
import { MaterialSection } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: MaterialSection[];
  targetSectionId?: string;
  currencySymbol: string;
  onAddItemToSection: (sectionId: string, item: {
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
    sku?: string;
  }) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  sections,
  targetSectionId,
  currencySymbol,
  onAddItemToSection,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    targetSectionId || (sections[0]?.id ?? '')
  );
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(COMMON_ELECTRICAL_ITEMS.map((i) => i.category)))];

  const filteredItems = COMMON_ELECTRICAL_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item: typeof COMMON_ELECTRICAL_ITEMS[0]) => {
    let destId = selectedSectionId;
    if (!destId && sections.length > 0) {
      destId = sections[0].id;
    }
    if (!destId) {
      alert('Please create a section first!');
      return;
    }

    onAddItemToSection(destId, {
      description: item.description,
      quantity: 1,
      unit: item.unit,
      unitCost: item.unitCost,
      sku: 'SKU-' + item.category.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100),
    });

    setAddedItemName(item.description);
    setTimeout(() => {
      setAddedItemName(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-[#233554] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a1020] border-b border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Electrical Contractor Materials Catalog
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Destination */}
        <div className="p-4 bg-[#0c1527] border-b border-[#1e2d4a] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search materials (e.g. breaker, conduit, cable, GFCI)..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Target Section Selector */}
            {sections.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 whitespace-nowrap">Add to:</span>
                <select
                  value={selectedSectionId || sections[0]?.id}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="bg-[#0a0f1d] border border-[#223354] rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-[#142038] hover:bg-[#1c2c4c] text-slate-300 border border-[#203150]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              No matching items found. Try a different search term.
            </p>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#111c33] border border-[#1e2f50] hover:border-blue-500/40 flex items-center justify-between gap-3 transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {item.description}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>Unit: {item.unit}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      Standard Cost: {formatCurrency(item.unitCost, currencySymbol)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(item)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  {addedItemName === item.description ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a1020] border-t border-[#1e2d4a] flex items-center justify-between text-xs text-slate-400">
          <span>{filteredItems.length} electrical components available</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
