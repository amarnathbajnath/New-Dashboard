import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus,
  Trash2, 
  Layers, 
  Lightbulb, 
  CheckCircle2, 
  Cloud, 
  Camera, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  X,
  FileText
} from 'lucide-react';
import { MaterialItem, MaterialSection } from '../types';
import { formatCurrency } from '../utils/calculations';
import { RichTextEditor } from './RichTextEditor';

interface MaterialsWorkspaceProps {
  sections: MaterialSection[];
  currencySymbol: string;
  onUpdateSections: (sections: MaterialSection[]) => void;
  onOpenAddSectionModal: () => void;
  onOpenCatalog: (targetSectionId?: string) => void;
  isCloudSyncActive: boolean;
  onToggleCloudSync: () => void;
}

const STANDARD_UNITS = [
  { value: 'each', label: 'each' },
  { value: 'pcs', label: 'pcs' },
  { value: 'ft.', label: 'ft.' },
  { value: 'ft', label: 'feet' },
  { value: 'm', label: 'meter' },
  { value: 'length', label: 'length' },
  { value: 'roll', label: 'roll' },
  { value: 'box', label: 'box' },
  { value: 'pack', label: 'pack' },
  { value: 'lot', label: 'lot' },
  { value: 'tin', label: 'tin' },
  { value: 'tube', label: 'tube' },
  { value: 'set', label: 'set' },
  { value: 'pair', label: 'pair' },
];

const QUICK_QUANTITIES = [1, 2, 5, 10, 20, 50, 100];

export const MaterialsWorkspace: React.FC<MaterialsWorkspaceProps> = ({
  sections,
  currencySymbol,
  onUpdateSections,
  onOpenAddSectionModal,
  onOpenCatalog,
  isCloudSyncActive,
  onToggleCloudSync,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showScanSimulation, setShowScanSimulation] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  // Add Item Modal state (asks for quantity & item details when adding an item)
  const [addItemSectionId, setAddItemSectionId] = useState<string | null>(null);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemQty, setNewItemQty] = useState<string>('1');
  const [newItemUnit, setNewItemUnit] = useState('each');
  const [newItemUnitCost, setNewItemUnitCost] = useState<string>('0');
  const descInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (addItemSectionId) {
      const timer = setTimeout(() => {
        descInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [addItemSectionId]);

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateSectionName = (sectionId: string, newName: string) => {
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, name: newName } : sec
    );
    onUpdateSections(updated);
  };

  const handleUpdateSectionScope = (sectionId: string, scopeOfWork: string) => {
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, scopeOfWork } : sec
    );
    onUpdateSections(updated);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      if (!confirm('This is your only section. Are you sure you want to remove it?')) return;
    }
    const updated = sections.filter((sec) => sec.id !== sectionId);
    onUpdateSections(updated);
  };

  const handleOpenAddItemModal = (sectionId: string) => {
    setAddItemSectionId(sectionId);
    setNewItemDesc('');
    setNewItemSku('');
    setNewItemQty('1');
    setNewItemUnit('each');
    setNewItemUnitCost('0');
  };

  const handleConfirmAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addItemSectionId) return;

    const parsedQty = parseFloat(newItemQty);
    const finalQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1;
    const parsedCost = parseFloat(newItemUnitCost) || 0;

    const newItem: MaterialItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      description: newItemDesc.trim() || 'Custom Material Item',
      quantity: finalQty,
      unit: newItemUnit || 'each',
      unitCost: parsedCost,
      sku: newItemSku.trim(),
    };

    const updated = sections.map((sec) => {
      if (sec.id === addItemSectionId) {
        return { ...sec, items: [...sec.items, newItem] };
      }
      return sec;
    });
    onUpdateSections(updated);
    setAddItemSectionId(null);
  };

  const handleUpdateItem = (
    sectionId: string,
    itemId: string,
    field: keyof MaterialItem,
    value: any
  ) => {
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        const newItems = sec.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, [field]: value };
          }
          return item;
        });
        return { ...sec, items: newItems };
      }
      return sec;
    });
    onUpdateSections(updated);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.filter((item) => item.id !== itemId) };
      }
      return sec;
    });
    onUpdateSections(updated);
  };

  const handleDuplicateItem = (sectionId: string, item: MaterialItem) => {
    const newItem: MaterialItem = {
      ...item,
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      description: `${item.description} (Copy)`,
    };
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, newItem] };
      }
      return sec;
    });
    onUpdateSections(updated);
  };

  const handleSimulateScan = () => {
    setShowScanSimulation(true);
    setScanStatus('Scanning optical barcode/SKU via Camera simulation...');
    setTimeout(() => {
      setScanStatus('Recognized SKU #BRK-20A-SP: 20A Circuit Breaker ($48.00 TTD)');
      setTimeout(() => {
        if (sections.length > 0) {
          const scannedItem: MaterialItem = {
            id: 'scan-' + Date.now(),
            description: '20A Single Pole Plug-in Circuit Breaker (Scanned)',
            quantity: 1,
            unit: 'pcs',
            unitCost: 48.00,
            sku: 'BRK-20A-SP',
          };
          const updated = sections.map((s, idx) =>
            idx === 0 ? { ...s, items: [...s.items, scannedItem] } : s
          );
          onUpdateSections(updated);
        }
        setShowScanSimulation(false);
        setScanStatus(null);
      }, 1400);
    }, 1200);
  };

  const activeSectionForAdd = sections.find((s) => s.id === addItemSectionId);
  const numericNewQty = Math.max(0, parseFloat(newItemQty) || 0);
  const numericNewCost = Math.max(0, parseFloat(newItemUnitCost) || 0);

  return (
    <div className="space-y-6 pt-2">
      {/* Materials Workspace Title */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold tracking-wider uppercase text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Materials Workspace
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCatalog()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#131d33] hover:bg-[#1a2846] text-blue-300 border border-blue-500/30 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Electrical Catalog</span>
          </button>
          <button
            onClick={onOpenAddSectionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-[#223354] bg-[#0c1322]/50 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-500 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-slate-200">No Material Sections Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Organize your materials by adding sections such as Distribution, Conduit, Wiring, or Outlets.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onOpenAddSectionModal}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition cursor-pointer"
            >
              + Create Section
            </button>
            <button
              onClick={() => onOpenCatalog()}
              className="px-4 py-2 rounded-lg bg-[#141e35] hover:bg-[#1a2846] text-slate-200 border border-[#223354] text-sm font-medium transition cursor-pointer"
            >
              Pick from Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sIndex) => {
            const isCollapsed = !!collapsedSections[section.id];
            const sectionSubtotal = section.items.reduce(
              (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
              0
            );

            return (
              <div
                key={section.id}
                className="rounded-xl border border-[#1e2d4a] bg-[#111a2e]/90 overflow-hidden shadow-sm transition"
              >
                {/* Section Header */}
                <div className="px-4 py-3 bg-[#0d1628] border-b border-[#1c2a44] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                    <button
                      onClick={() => toggleSectionCollapse(section.id)}
                      className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-xs font-mono font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      0{sIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => handleUpdateSectionName(section.id, e.target.value)}
                      placeholder="Section Name (e.g. Panel & Distribution)"
                      className="font-bold text-sm text-slate-100 bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-400 focus:outline-none px-1 py-0.5 max-w-sm flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-xs font-mono text-slate-300 bg-[#090f1d] px-2.5 py-1 rounded border border-[#1f2f4e]">
                      <span className="text-slate-500 mr-1.5">Subtotal:</span>
                      <span className="font-semibold text-emerald-400">
                        {formatCurrency(sectionSubtotal, currencySymbol)}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenCatalog(section.id)}
                      title="Add items from catalog"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-500/10 transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Catalog</span>
                    </button>

                    <button
                      onClick={() => handleOpenAddItemModal(section.id)}
                      title="Add custom item"
                      className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Item</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      title="Delete section"
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Scope of Work + Items Table */}
                {!isCollapsed && (
                  <div>
                    <div className="p-3.5 sm:p-4 bg-[#0b1323] border-b border-[#1c2a44] space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Scope of Work</span>
                      </div>
                      <RichTextEditor
                        value={section.scopeOfWork || ''}
                        onChange={(html) => handleUpdateSectionScope(section.id, html)}
                        placeholder={`Write the scope of work for "${section.name || 'this section'}" (supports Bold, Italics, Bullet & Numbered lists)...`}
                        minHeightClass="min-h-[76px]"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#1c2a44] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#0a1020]/60">
                          <th className="py-2.5 px-3.5 min-w-[200px]">Description</th>
                          <th className="py-2.5 px-2.5 w-24">SKU / Code</th>
                          <th className="py-2.5 px-2.5 w-20 text-center">Qty</th>
                          <th className="py-2.5 px-2.5 w-24">Unit</th>
                          <th className="py-2.5 px-2.5 w-28 text-right">Unit Cost</th>
                          <th className="py-2.5 px-2.5 w-28 text-right">Total</th>
                          <th className="py-2.5 px-2.5 w-16 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#182338]">
                        {section.items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-slate-500">
                              No items in this section yet.{' '}
                              <button
                                onClick={() => handleOpenAddItemModal(section.id)}
                                className="text-blue-400 hover:underline font-semibold cursor-pointer"
                              >
                                Click here to add an item
                              </button>
                              {' '}or{' '}
                              <button
                                onClick={() => onOpenCatalog(section.id)}
                                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                              >
                                pick from Catalog
                              </button>
                            </td>
                          </tr>
                        ) : (
                          section.items.map((item) => {
                            const lineTotal =
                              (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
                            const hasStandardUnit = STANDARD_UNITS.some((u) => u.value === item.unit);

                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-[#142038]/40 transition group"
                              >
                                {/* Description */}
                                <td className="py-2 px-3.5">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) =>
                                      handleUpdateItem(section.id, item.id, 'description', e.target.value)
                                    }
                                    placeholder="Material description or specification"
                                    className="w-full bg-transparent border-b border-transparent hover:border-[#2a3c60] focus:border-blue-500 focus:outline-none text-slate-200 text-xs py-1"
                                  />
                                </td>

                                {/* SKU */}
                                <td className="py-2 px-2.5">
                                  <input
                                    type="text"
                                    value={item.sku || ''}
                                    onChange={(e) =>
                                      handleUpdateItem(section.id, item.id, 'sku', e.target.value)
                                    }
                                    placeholder="SKU-001"
                                    className="w-full bg-transparent border-b border-transparent hover:border-[#2a3c60] focus:border-blue-500 focus:outline-none text-slate-400 font-mono text-[11px] py-1"
                                  />
                                </td>

                                {/* Quantity */}
                                <td className="py-2 px-2.5 text-center">
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleUpdateItem(
                                        section.id,
                                        item.id,
                                        'quantity',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 text-center bg-[#0a0f1d] border border-[#223354] rounded px-1.5 py-1 text-slate-100 font-mono text-xs focus:border-blue-500 focus:outline-none"
                                  />
                                </td>

                                {/* Unit */}
                                <td className="py-2 px-2.5">
                                  <select
                                    value={item.unit}
                                    onChange={(e) =>
                                      handleUpdateItem(section.id, item.id, 'unit', e.target.value)
                                    }
                                    className="bg-[#0a0f1d] border border-[#223354] rounded px-1.5 py-1 text-slate-300 text-xs focus:border-blue-500 focus:outline-none"
                                  >
                                    {!hasStandardUnit && item.unit && (
                                      <option value={item.unit}>{item.unit}</option>
                                    )}
                                    {STANDARD_UNITS.map((u) => (
                                      <option key={u.value} value={u.value}>
                                        {u.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Unit Cost */}
                                <td className="py-2 px-2.5 text-right">
                                  <div className="relative inline-block w-24">
                                    <span className="absolute left-2 top-1 text-slate-500 text-xs">
                                      {currencySymbol}
                                    </span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      value={item.unitCost}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          section.id,
                                          item.id,
                                          'unitCost',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-full text-right bg-[#0a0f1d] border border-[#223354] rounded pl-5 pr-2 py-1 text-slate-100 font-mono text-xs focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>
                                </td>

                                {/* Line Total */}
                                <td className="py-2 px-2.5 text-right font-mono font-semibold text-slate-200">
                                  {formatCurrency(lineTotal, currencySymbol)}
                                </td>

                                {/* Actions */}
                                <td className="py-2 px-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition">
                                    <button
                                      onClick={() => handleDuplicateItem(section.id, item)}
                                      title="Duplicate item"
                                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-[#1a2846] rounded cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(section.id, item.id)}
                                      title="Delete item"
                                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pro Tip Box - matching screenshot text & styling */}
      <div className="rounded-xl border border-[#1e355b] bg-[#0c162b] p-4 text-xs space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Pro Tip</span>
          </div>

          <button
            onClick={handleSimulateScan}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#13223f] hover:bg-[#1b2f56] text-blue-300 border border-blue-500/30 text-[11px] font-medium transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>Simulate Barcode / SKU Scan</span>
          </button>
        </div>

        <p className="text-slate-300">
          Future upgrades could include Camera-based SKU scanning.
        </p>

        {showScanSimulation && (
          <div className="p-2.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2 animate-pulse">
            <Camera className="w-4 h-4 text-blue-400 animate-spin" />
            <span>{scanStatus}</span>
          </div>
        )}

        <div className="space-y-1 pt-0.5">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Offline-first support (PWA) Implemented!</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-300 font-medium">
              <Cloud className="w-4 h-4 shrink-0 text-teal-400" />
              <span>{isCloudSyncActive ? 'Cloud Sync Active!' : 'Cloud Sync Idle'}</span>
            </div>
            <button
              onClick={onToggleCloudSync}
              className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
            >
              {isCloudSyncActive ? 'Pause Cloud Sync' : 'Turn On'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Modal (asks for quantity & details when adding an item to a section) */}
      {addItemSectionId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setAddItemSectionId(null);
          }}
        >
          <form
            onSubmit={handleConfirmAddItem}
            className="w-full max-w-md bg-[#0f172a] border border-[#233554] rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2d4a]">
              <div>
                <h3 className="font-bold text-sm text-white">Add Material Item</h3>
                <p className="text-[11px] text-slate-400">
                  Section: {activeSectionForAdd?.name || 'Materials'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const secId = addItemSectionId;
                    setAddItemSectionId(null);
                    onOpenCatalog(secId);
                  }}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 cursor-pointer"
                >
                  Pick from Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setAddItemSectionId(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Item Description
              </label>
              <input
                ref={descInputRef}
                type="text"
                required
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="e.g. 20A Single Pole Circuit Breaker"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                What quantity would you like to add?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(newItemQty) || 0;
                    setNewItemQty(String(Math.max(0.5, Math.round((cur - 1) * 100) / 100)));
                  }}
                  className="p-2 rounded-lg bg-[#142038] hover:bg-[#1e2e4f] border border-[#223558] text-slate-200 transition cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="flex-1 text-center py-2 px-3 rounded-lg bg-[#0a0f1d] border border-blue-500/60 text-white font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(newItemQty) || 0;
                    setNewItemQty(String(Math.round((cur + 1) * 100) / 100));
                  }}
                  className="p-2 rounded-lg bg-[#142038] hover:bg-[#1e2e4f] border border-[#223558] text-slate-200 transition cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_QUANTITIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setNewItemQty(String(q))}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition cursor-pointer ${
                      numericNewQty === q
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#142038] hover:bg-[#1d2d4d] text-slate-300 border border-[#223558]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Unit
                </label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#223354] rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {STANDARD_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Unit Cost
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  SKU (Opt)
                </label>
                <input
                  type="text"
                  value={newItemSku}
                  onChange={(e) => setNewItemSku(e.target.value)}
                  placeholder="SKU-001"
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0a1020] border border-[#1e2d4a] flex items-center justify-between text-xs">
              <span className="text-slate-400">Line Subtotal:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(numericNewQty * numericNewCost, currencySymbol)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2d4a]">
              <button
                type="button"
                onClick={() => setAddItemSectionId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#1a2846] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newItemDesc.trim() || numericNewQty <= 0}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item (Qty: {numericNewQty})</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
