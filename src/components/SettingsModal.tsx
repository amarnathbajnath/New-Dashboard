import React, { useState } from 'react';
import { Settings, X, Save, RefreshCw, Check, Globe, Wifi } from 'lucide-react';
import { CompanySettings } from '../types';
import { DEFAULT_COMPANY_SETTINGS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [form, setForm] = useState<CompanySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Reset to default company settings?')) {
      setForm(DEFAULT_COMPANY_SETTINGS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#0f172a] border border-[#233554] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a1020] border-b border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Contractor &amp; System Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Company / Contractor Name
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Subtitle / Credentials
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Business Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Tax / VAT Registration No.
            </label>
            <input
              type="text"
              value={form.taxRegistrationNo}
              onChange={(e) => setForm({ ...form, taxRegistrationNo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="pt-2 border-t border-[#1e2d4a] grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Default Markup %
              </label>
              <input
                type="number"
                step="0.1"
                value={form.defaultMarkupPercent}
                onChange={(e) =>
                  setForm({ ...form, defaultMarkupPercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Default VAT %
              </label>
              <input
                type="number"
                step="0.1"
                value={form.defaultVatPercent}
                onChange={(e) =>
                  setForm({ ...form, defaultVatPercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                value={form.currencyCode}
                onChange={(e) => setForm({ ...form, currencyCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#223354] text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono uppercase"
              />
            </div>
          </div>

          {/* GitHub Static Site & Offline Notice */}
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-slate-300 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Static Site &amp; Offline Ready</span>
            </div>
            <p className="text-slate-400">
              This app is built to run entirely client-side. When exported or built with `npm run build`, the output folder can be hosted directly on GitHub Pages, Netlify, or Vercel with zero backend dependencies. Real-time sync operates between open browser tabs automatically.
            </p>
          </div>

          <div className="pt-3 border-t border-[#1e2d4a] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#1a2846] transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
