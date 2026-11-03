import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Check, 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  RotateCcw,
  AlertCircle,
  FileText
} from 'lucide-react';
import { CatalogItem, MaterialSection } from '../types';
import { formatCurrency, downloadFile } from '../utils/calculations';
import { parseCatalogCsv, exportCatalogToCsv } from '../utils/csvParser';
import { COMMON_ELECTRICAL_ITEMS } from '../constants';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: CatalogItem[];
  onUpdateCatalog: (newCatalog: CatalogItem[]) => void;
  sections: MaterialSection[];
  targetSectionId?: string;
  currencySymbol: string;
  onSyncFromGoogleSheets?: () => Promise<void>;
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
  catalog,
  onUpdateCatalog,
  sections,
  targetSectionId,
  currencySymbol,
  onSyncFromGoogleSheets,
  onAddItemToSection,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    targetSectionId || (sections[0]?.id ?? '')
  );
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // CSV Import states
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteCsvText, setPasteCsvText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(catalog.map((i) => i.category)))];

  const filteredItems = catalog.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item: CatalogItem) => {
    let destId = selectedSectionId;
    if (!destId && sections.length > 0) {
      destId = sections[0].id;
    }
    if (!destId) {
      alert('Please create a section first before adding materials.');
      return;
    }

    onAddItemToSection(destId, {
      description: item.description,
      quantity: 1,
      unit: item.unit,
      unitCost: item.unitCost,
      sku: item.sku || ('SKU-' + item.category.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100)),
    });

    setAddedItemName(item.description);
    setTimeout(() => {
      setAddedItemName(null);
    }, 1500);
  };

  const processCsvContent = (csvString: string) => {
    try {
      setImportError(null);
      const parsedItems = parseCatalogCsv(csvString);
      
      let finalCatalog: CatalogItem[];
      if (importMode === 'replace') {
        finalCatalog = parsedItems;
      } else {
        finalCatalog = [...catalog, ...parsedItems];
      }

      onUpdateCatalog(finalCatalog);
      setImportSuccessMessage(
        `Successfully imported and synced ${parsedItems.length} catalog items!`
      );
      setIsPasteModalOpen(false);
      setPasteCsvText('');

      setTimeout(() => {
        setImportSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse CSV file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processCsvContent(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportCatalog = () => {
    const csvData = exportCatalogToCsv(catalog);
    downloadFile(csvData, 'Electrical-Catalog.csv', 'text/csv;charset=utf-8;');
  };

  const handleDownloadSample = () => {
    const sampleCsv = `SKU,Item,Unit,Price,Logical_Group
SRV-001,1 1/2" Heat Shrink,ft.,$23.95,1. Service Entrance & Utility
SRV-002,100A 1-Phase Meter Base,each,,1. Service Entrance & Utility
SRV-003,125A 1-Phase Meter Base,each,$170.00,1. Service Entrance & Utility
SRV-004,2-Way 100A 1-PH Meter Bank,each,"$1,050.00",1. Service Entrance & Utility
SRV-005,2-Way 200A 1-PH Meter Bank - B.E.L.,each,"$2,348.36",1. Service Entrance & Utility
SRV-006,2-Way 200A 1-PH Meter Bank (M.E. - TQD/ CA Breakers),each,"$2,650.00",1. Service Entrance & Utility
SRV-008,200A 1-Phase Meter Base,each,$225.00,1. Service Entrance & Utility
SRV-010,200A 1-Phase Stainless Steel Meter Base,each,$895.00,1. Service Entrance & Utility`;
    downloadFile(sampleCsv, 'Catalog-Template.csv', 'text/csv;charset=utf-8;');
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset to default standard electrical catalog?')) {
      onUpdateCatalog(COMMON_ELECTRICAL_ITEMS);
      setImportSuccessMessage('Catalog reset to standard electrical components.');
      setTimeout(() => setImportSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-[#0f172a] border border-[#233554] rounded-2xl shadow-2xl flex flex-col max-h-[88vh] text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a1020] border-b border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Electrical Materials &amp; Parts Catalog
              </h3>
              <p className="text-[11px] text-slate-400">
                {catalog.length} items synced • Live available to all quotes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,text/csv"
              className="hidden"
            />

            {onSyncFromGoogleSheets && (
              <button
                onClick={async () => {
                  setIsSyncingGoogle(true);
                  try {
                    await onSyncFromGoogleSheets();
                    setImportSuccessMessage('Synced live from Google Sheets!');
                    setTimeout(() => setImportSuccessMessage(null), 3000);
                  } catch (e: any) {
                    setImportError(e.message || 'Failed to sync from Google Sheets.');
                  } finally {
                    setIsSyncingGoogle(false);
                  }
                }}
                disabled={isSyncingGoogle}
                title="Fetch latest items directly from your Google Sheets CSV"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer active:scale-95 shadow-sm disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSyncingGoogle ? 'animate-spin' : ''}`} />
                <span>{isSyncingGoogle ? 'Syncing...' : 'Sync Google Sheet'}</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload CSV to import and sync catalog items"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={() => setIsPasteModalOpen(true)}
              title="Paste CSV text directly"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#142038] hover:bg-[#1e2e4f] text-slate-200 border border-[#223558] transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Paste CSV</span>
            </button>

            <button
              onClick={handleExportCatalog}
              title="Export current catalog to CSV"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#142038] hover:bg-[#1e2e4f] text-slate-300 border border-[#223558] transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success or Error Banners */}
        {importSuccessMessage && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importSuccessMessage}</span>
          </div>
        )}

        {importError && (
          <div className="px-6 py-2 bg-rose-950/80 border-b border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{importError}</span>
            </div>
            <button onClick={() => setImportError(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
                placeholder="Search items by description, SKU, or category..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Target Section Selector */}
            {sections.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 whitespace-nowrap">Add to Section:</span>
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
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
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
            <div className="py-12 text-center space-y-3">
              <p className="text-xs text-slate-400">
                No matching materials found in the catalog.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import from CSV</span>
              </button>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-xl bg-[#111c33] border border-[#1e2f50] hover:border-blue-500/40 flex items-center justify-between gap-3 transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {item.description}
                    </span>
                    {item.sku && (
                      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                        [{item.sku}]
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>Unit: {item.unit}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      Cost: {formatCurrency(item.unitCost, currencySymbol)}
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

        {/* Footer with CSV Utilities */}
        <div className="px-6 py-3 bg-[#0a1020] border-t border-[#1e2d4a] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSample}
              className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Done
          </button>
        </div>

        {/* Paste CSV Sub-Modal */}
        {isPasteModalOpen && (
          <div className="absolute inset-0 z-50 bg-[#0a1020]/95 backdrop-blur-xs p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2d4a]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-sm text-white">Import &amp; Sync Catalog CSV</h4>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex-1 flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Paste your raw CSV rows below (with headers):</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                    />
                    <span>Replace Catalog</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                    />
                    <span>Append to Existing</span>
                  </label>
                </div>
              </div>

              <textarea
                value={pasteCsvText}
                onChange={(e) => setPasteCsvText(e.target.value)}
                placeholder={`SKU,Item,Unit,Price,Logical_Group
SRV-001,1 1/2" Heat Shrink,ft.,$23.95,1. Service Entrance & Utility
SRV-002,100A 1-Phase Meter Base,each,,1. Service Entrance & Utility
SRV-003,125A 1-Phase Meter Base,each,$170.00,1. Service Entrance & Utility
SRV-004,2-Way 100A 1-PH Meter Bank,each,"$1,050.00",1. Service Entrance & Utility`}
                className="w-full flex-1 p-3 rounded-lg bg-[#0a0f1d] border border-[#223354] text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500 resize-none min-h-[220px]"
              />

              {importError && (
                <p className="text-xs text-rose-400 font-semibold">{importError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1e2d4a]">
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => processCsvContent(pasteCsvText)}
                disabled={!pasteCsvText.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition shadow-sm"
              >
                Import &amp; Sync Catalog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
