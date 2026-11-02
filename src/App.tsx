/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { JobDetails } from './components/JobDetails';
import { RatesAndLabour } from './components/RatesAndLabour';
import { NotesSection } from './components/NotesSection';
import { MaterialsWorkspace } from './components/MaterialsWorkspace';
import { EstimateSummary } from './components/EstimateSummary';
import { AddSectionModal } from './components/AddSectionModal';
import { CatalogModal } from './components/CatalogModal';
import { LoadQuotesModal } from './components/LoadQuotesModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { JobQuote, CompanySettings, MaterialSection } from './types';
import { BLANK_QUOTE, INITIAL_SAMPLE_QUOTE } from './constants';
import { 
  calculateQuoteTotals, 
  generateCsvContent, 
  downloadFile, 
  generateNextQuoteNo 
} from './utils/calculations';
import { SyncManager } from './utils/syncManager';
import { Check, Info, AlertTriangle } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Company settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() =>
    SyncManager.loadCompanySettings()
  );

  // Active Quote state
  const [quote, setQuote] = useState<JobQuote>(() => SyncManager.loadActiveQuote());

  // Saved Quotes library
  const [savedQuotes, setSavedQuotes] = useState<JobQuote[]>(() =>
    SyncManager.loadSavedQuotes()
  );

  // Sync state
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [peerCount, setPeerCount] = useState<number>(0);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState<boolean>(true);

  // Modals state
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogTargetSectionId, setCatalogTargetSectionId] = useState<string | undefined>();
  const [isLoadQuotesOpen, setIsLoadQuotesOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'info' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync Manager ref
  const syncManagerRef = useRef<SyncManager | null>(null);
  const isRemoteUpdateRef = useRef(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = SyncManager.loadTheme();
    setTheme(savedTheme);
    SyncManager.saveTheme(savedTheme);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    SyncManager.saveTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // Initialize real-time synchronization manager
  useEffect(() => {
    const sm = new SyncManager();
    syncManagerRef.current = sm;

    sm.onRemoteUpdate((remoteQuote) => {
      isRemoteUpdateRef.current = true;
      setQuote(remoteQuote);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      showToast(`Real-time update received from another tab`, 'info');
    });

    sm.onPeerCountChange((count) => {
      setPeerCount(count);
    });

    const handleOnline = () => {
      setSyncStatus('synced');
      showToast('Network online. Synchronized.', 'info');
    };
    const handleOffline = () => {
      setSyncStatus('offline');
      showToast('Working offline. Local changes safely persisted.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      sm.destroy();
    };
  }, []);

  // Debounced auto-save & broadcast to other tabs on local edit
  useEffect(() => {
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    setSyncStatus('syncing');

    const timer = setTimeout(() => {
      SyncManager.saveActiveQuote(quote);
      if (syncManagerRef.current) {
        syncManagerRef.current.broadcastQuoteUpdate(quote);
      }
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    }, 250);

    return () => clearTimeout(timer);
  }, [quote]);

  // Handlers for quote edits
  const handleUpdateQuote = useCallback((fields: Partial<JobQuote>) => {
    setQuote((prev) => ({
      ...prev,
      ...fields,
      lastModified: Date.now(),
    }));
  }, []);

  const handleUpdateSections = useCallback((newSections: MaterialSection[]) => {
    setQuote((prev) => ({
      ...prev,
      sections: newSections,
      lastModified: Date.now(),
    }));
  }, []);

  // Actions
  const handleNewQuote = () => {
    if (
      quote.sections.length > 0 &&
      !confirm('Start a new estimate? Unsaved changes will be replaced.')
    ) {
      return;
    }

    const nextQuoteNo = generateNextQuoteNo(savedQuotes);
    const newQuote: JobQuote = {
      ...BLANK_QUOTE,
      id: 'quote-' + Date.now(),
      quoteNo: nextQuoteNo,
      date: new Date().toISOString().split('T')[0],
      markupPercent: companySettings.defaultMarkupPercent,
      vatPercent: companySettings.defaultVatPercent,
      currencySymbol: companySettings.currencySymbol,
      currencyCode: companySettings.currencyCode,
      sections: [
        {
          id: 'sec-' + Date.now(),
          name: 'Main Distribution & Service Panel',
          items: [],
        },
      ],
    };
    setQuote(newQuote);
    showToast(`New estimate ${nextQuoteNo} created`);
  };

  const handleSaveQuote = () => {
    const updatedLibrary = SyncManager.saveQuoteToLibrary(quote);
    setSavedQuotes(updatedLibrary);
    showToast(`Quote ${quote.quoteNo} saved to library`);
  };

  const handleManualRefresh = () => {
    setSyncStatus('syncing');
    const freshActive = SyncManager.loadActiveQuote();
    const freshSaved = SyncManager.loadSavedQuotes();
    const freshSettings = SyncManager.loadCompanySettings();
    setQuote(freshActive);
    setSavedQuotes(freshSaved);
    setCompanySettings(freshSettings);

    setTimeout(() => {
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      showToast('Estimate data refreshed from storage');
    }, 300);
  };

  const handleToggleCloudSync = () => {
    const nextState = !isCloudSyncActive;
    setIsCloudSyncActive(nextState);
    if (nextState) {
      showToast('Cloud Sync activated: Connected to offline-first cache');
    } else {
      showToast('Cloud Sync paused: Operating in local-only mode', 'info');
    }
  };

  const handleExportCsv = () => {
    const csvContent = generateCsvContent(quote);
    downloadFile(
      csvContent,
      `Estimate-${quote.quoteNo || 'Electrical'}.csv`,
      'text/csv;charset=utf-8;'
    );
    showToast(`Exported ${quote.quoteNo} as CSV`);
  };

  const handleAddSection = (sectionName: string) => {
    const newSection: MaterialSection = {
      id: 'sec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: sectionName,
      items: [],
    };
    handleUpdateSections([...quote.sections, newSection]);
    showToast(`Added section "${sectionName}"`);
  };

  const handleOpenCatalog = (targetSecId?: string) => {
    setCatalogTargetSectionId(targetSecId);
    setIsCatalogOpen(true);
  };

  const handleAddItemFromCatalog = (
    sectionId: string,
    itemData: {
      description: string;
      quantity: number;
      unit: string;
      unitCost: number;
      sku?: string;
    }
  ) => {
    const newItem = {
      ...itemData,
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };

    const updatedSections = quote.sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, newItem] };
      }
      return sec;
    });

    handleUpdateSections(updatedSections);
    showToast(`Added ${itemData.description} to section`);
  };

  const handleSaveCompanySettings = (newSettings: CompanySettings) => {
    setCompanySettings(newSettings);
    SyncManager.saveCompanySettings(newSettings);
    // sync currency with quote if needed
    setQuote((prev) => ({
      ...prev,
      currencySymbol: newSettings.currencySymbol,
      currencyCode: newSettings.currencyCode,
    }));
    showToast('Company settings & default rates updated');
  };

  const handleDeleteSavedQuote = (idOrNo: string) => {
    const updated = SyncManager.deleteQuoteFromLibrary(idOrNo);
    setSavedQuotes(updated);
    showToast('Quote removed from library');
  };

  const handleImportQuote = (imported: JobQuote) => {
    const updatedLibrary = SyncManager.saveQuoteToLibrary(imported);
    setSavedQuotes(updatedLibrary);
    setQuote(imported);
    showToast(`Imported ${imported.quoteNo || 'Quote'}`);
  };

  // Calculations
  const totals = calculateQuoteTotals(quote);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === 'dark' ? 'dark bg-[#0b111e] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-blue-500/50 text-white text-xs font-medium shadow-2xl shadow-blue-900/40 animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage.type === 'info' ? (
            <Info className="w-4 h-4 text-blue-400" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar matching screenshot */}
      <Header
        company={companySettings}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        peerCount={peerCount}
        onRefresh={handleManualRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewQuote={handleNewQuote}
        onOpenLoadModal={() => setIsLoadQuotesOpen(true)}
        onSaveQuote={handleSaveQuote}
        isCloudSyncActive={isCloudSyncActive}
        onToggleCloudSync={handleToggleCloudSync}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Details, Rates & Labour, Notes, and Materials Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Unified Card: Job Details + Rates & Labour + Notes matching screenshot */}
            <div className="rounded-2xl border border-[#1e2c4a] bg-[#111a2e]/90 p-5 sm:p-6 shadow-sm space-y-6">
              {/* Top Split: Left Job Details, Right Rates & Labour */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <JobDetails
                  quote={quote}
                  onChange={handleUpdateQuote}
                />

                <RatesAndLabour
                  quote={quote}
                  onChange={handleUpdateQuote}
                />
              </div>

              {/* Notes Section spanning across */}
              <NotesSection
                notes={quote.notes}
                onChange={(notes) => handleUpdateQuote({ notes })}
              />
            </div>

            {/* Materials Workspace with Sections, Items, and Pro Tip banner */}
            <MaterialsWorkspace
              sections={quote.sections}
              currencySymbol={quote.currencySymbol || '$'}
              onUpdateSections={handleUpdateSections}
              onOpenAddSectionModal={() => setIsAddSectionOpen(true)}
              onOpenCatalog={handleOpenCatalog}
              isCloudSyncActive={isCloudSyncActive}
              onToggleCloudSync={handleToggleCloudSync}
            />
          </div>

          {/* Right Column: Estimate Summary Card + Action Buttons */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <EstimateSummary
              totals={totals}
              markupPercent={quote.markupPercent}
              vatPercent={quote.vatPercent}
              currencySymbol={quote.currencySymbol || '$'}
              onAddSection={() => setIsAddSectionOpen(true)}
              onGeneratePdf={() => setIsPdfPreviewOpen(true)}
              onExportCsv={handleExportCsv}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#1a263d] py-4 text-center text-xs text-slate-500 mt-12">
        <p>
          {companySettings.companyName} • Job Costing &amp; Estimator • All calculations automatically synchronized
        </p>
      </footer>

      {/* Modals */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onAdd={handleAddSection}
      />

      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        sections={quote.sections}
        targetSectionId={catalogTargetSectionId}
        currencySymbol={quote.currencySymbol || '$'}
        onAddItemToSection={handleAddItemFromCatalog}
      />

      <LoadQuotesModal
        isOpen={isLoadQuotesOpen}
        onClose={() => setIsLoadQuotesOpen(false)}
        quotes={savedQuotes}
        activeQuoteId={quote.id || quote.quoteNo}
        onSelectQuote={(selected) => setQuote(selected)}
        onDeleteQuote={handleDeleteSavedQuote}
        onImportQuote={handleImportQuote}
      />

      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        quote={quote}
        company={companySettings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={companySettings}
        onSave={handleSaveCompanySettings}
      />
    </div>
  );
}
