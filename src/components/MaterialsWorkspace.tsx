import React, { useState } from 'react';
import { 
  Plus, 
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
  DollarSign
} from 'lucide-react';
import { MaterialItem, MaterialSection } from '../types';
import { formatCurrency } from '../utils/calculations';

interface MaterialsWorkspaceProps {
  sections: MaterialSection[];
  currencySymbol: string;
  onUpdateSections: (sections: MaterialSection[]) => void;
  onOpenAddSectionModal: () => void;
  onOpenCatalog: (targetSectionId?: string) => void;
  isCloudSyncActive: boolean;
  onToggleCloudSync: () => void;
}

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

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateSectionName = (sectionId: string, newName: string) => {
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, name: newName } : sec
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

  const handleAddItem = (sectionId: string) => {
    const newItem: MaterialItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      description: '',
      quantity: 1,
      unit: 'pcs',
      unitCost: 0,
      sku: '',
    };

    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, newItem] };
      }
      return sec;
    });
    onUpdateSections(updated);
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
        // Add to first section or create section
        if (sections.length > 0) {
          const firstSecId = sections[0].id;
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

  return (
    <div className="space-y-6 pt-2">
      {/* Materials Workspace Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-wider uppercase text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Materials Workspace
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCatalog()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#131d33] hover:bg-[#1a2846] text-blue-300 border border-blue-500/30 transition cursor-pointer"
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
            >
              + Create Section
            </button>
            <button
              onClick={() => onOpenCatalog()}
              className="px-4 py-2 rounded-lg bg-[#141e35] hover:bg-[#1a2846] text-slate-200 border border-[#223354] text-sm font-medium transition"
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
                      className="text-slate-400 hover:text-white transition p-0.5"
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
                      className="font-bold text-sm text-slate-100 bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-400 focus:outline-none px-1 py-0.5 max-w-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-slate-300 bg-[#090f1d] px-2.5 py-1 rounded border border-[#1f2f4e]">
                      <span className="text-slate-500 mr-1.5">Subtotal:</span>
                      <span className="font-semibold text-emerald-400">
                        {formatCurrency(sectionSubtotal, currencySymbol)}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenCatalog(section.id)}
                      title="Add items from catalog"
                      className="hidden sm:flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-500/10 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Catalog</span>
                    </button>

                    <button
                      onClick={() => handleAddItem(section.id)}
                      title="Add item row"
                      className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Item</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      title="Delete section"
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Items Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#1c2a44] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#0a1020]/60">
                          <th className="py-2.5 px-3.5 min-w-[200px]">Description</th>
                          <th className="py-2.5 px-2.5 w-24">SKU / Code</th>
                          <th className="py-2.5 px-2.5 w-20 text-center">Qty</th>
                          <th className="py-2.5 px-2.5 w-20">Unit</th>
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
                                onClick={() => handleAddItem(section.id)}
                                className="text-blue-400 hover:underline font-semibold"
                              >
                                Click here to add an item
                              </button>
                            </td>
                          </tr>
                        ) : (
                          section.items.map((item) => {
                            const lineTotal =
                              (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);

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
                                    step="1"
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
                                    <option value="pcs">pcs</option>
                                    <option value="length">length</option>
                                    <option value="m">meter</option>
                                    <option value="ft">feet</option>
                                    <option value="roll">roll</option>
                                    <option value="box">box</option>
                                    <option value="pack">pack</option>
                                    <option value="lot">lot</option>
                                    <option value="tin">tin</option>
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
                                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-[#1a2846] rounded"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(section.id, item.id)}
                                      title="Delete item"
                                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded"
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
              className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold"
            >
              {isCloudSyncActive ? 'Pause Cloud Sync' : 'Turn On'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
