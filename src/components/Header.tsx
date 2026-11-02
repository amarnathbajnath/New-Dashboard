import React from 'react';
import { 
  Zap, 
  RotateCw, 
  Settings, 
  Moon, 
  Sun, 
  Plus, 
  FolderOpen, 
  Save, 
  Cloud,
  CheckCircle2,
  Users
} from 'lucide-react';
import { CompanySettings } from '../types';

interface HeaderProps {
  company: CompanySettings;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncedAt: Date | null;
  peerCount: number;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onNewQuote: () => void;
  onOpenLoadModal: () => void;
  onSaveQuote: () => void;
  isCloudSyncActive: boolean;
  onToggleCloudSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  theme,
  onToggleTheme,
  syncStatus,
  peerCount,
  onRefresh,
  onOpenSettings,
  onNewQuote,
  onOpenLoadModal,
  onSaveQuote,
  isCloudSyncActive,
  onToggleCloudSync,
}) => {
  return (
    <header className="w-full border-b border-[#1c2942] dark:border-[#1c2942] bg-[#0c1322] dark:bg-[#0c1322] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-blue-500 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Job Costing
            </h1>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {company.companyName}
            </p>
          </div>
        </div>

        {/* Top Right Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Peer Sync Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131d33] border border-[#223354] text-xs font-medium text-slate-300">
            {syncStatus === 'syncing' ? (
              <>
                <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span className="text-slate-300">Syncing...</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300">Live Synced</span>
                {peerCount > 0 && (
                  <span className="ml-1 inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold" title={`${peerCount} other tab(s) connected in real-time`}>
                    <Users className="w-3 h-3" />
                    {peerCount + 1}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Reload from local storage / sync"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#141e35] hover:bg-[#1a2846] text-slate-300 hover:text-white border border-[#223354] transition cursor-pointer active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 rounded-md text-slate-300 hover:text-white bg-[#141e35] hover:bg-[#1a2846] border border-[#223354] transition cursor-pointer active:scale-95"
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-300" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Company Settings & Pricing Rates"
            className="p-1.5 rounded-md text-slate-300 hover:text-white bg-[#141e35] hover:bg-[#1a2846] border border-[#223354] transition cursor-pointer active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Primary Action Bar (New, Load, Save, Sync) matching screenshot */}
      <div className="max-w-[1600px] mx-auto mt-3.5 flex flex-wrap items-center gap-2.5">
        <button
          onClick={onNewQuote}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#131d33] hover:bg-[#1a2846] text-slate-200 border border-[#223354] transition cursor-pointer active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>New</span>
        </button>

        <button
          onClick={onOpenLoadModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#131d33] hover:bg-[#1a2846] text-slate-200 border border-[#223354] transition cursor-pointer active:scale-95 shadow-sm"
        >
          <FolderOpen className="w-4 h-4 text-slate-300" />
          <span>Load</span>
        </button>

        <button
          onClick={onSaveQuote}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#131d33] hover:bg-[#1a2846] text-slate-200 border border-[#223354] transition cursor-pointer active:scale-95 shadow-sm"
        >
          <Save className="w-4 h-4 text-emerald-400" />
          <span>Save</span>
        </button>

        <button
          onClick={onToggleCloudSync}
          title={isCloudSyncActive ? 'Cloud Sync is Active (Click to force re-sync)' : 'Activate Cloud Sync'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer active:scale-95 shadow-md ${
            isCloudSyncActive
              ? 'bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold shadow-blue-500/25 ring-2 ring-blue-400/50'
              : 'bg-[#131d33] hover:bg-[#1a2846] text-slate-300 border border-[#223354]'
          }`}
        >
          <Cloud className={`w-4 h-4 ${isCloudSyncActive ? 'fill-current text-white' : 'text-blue-400'}`} />
          <span>Sync</span>
          {isCloudSyncActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          )}
        </button>
      </div>
    </header>
  );
};
