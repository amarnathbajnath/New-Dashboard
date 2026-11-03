import { COMMON_ELECTRICAL_ITEMS, DEFAULT_COMPANY_SETTINGS, INITIAL_SAMPLE_QUOTE } from '../constants';
import { CatalogItem, CompanySettings, JobQuote, SyncMessage } from '../types';

const STORAGE_ACTIVE_QUOTE_KEY = 'risha_active_quote_v1';
const STORAGE_SAVED_QUOTES_KEY = 'risha_saved_quotes_v1';
const STORAGE_COMPANY_KEY = 'risha_company_settings_v1';
const STORAGE_THEME_KEY = 'risha_theme_v1';
const STORAGE_CUSTOM_CATALOG_KEY = 'risha_custom_catalog_v1';
const CHANNEL_NAME = 'risha_job_costing_channel';

export class SyncManager {
  private channel: BroadcastChannel | null = null;
  private senderId: string;
  private onRemoteUpdateCallback: ((quote: JobQuote) => void) | null = null;
  private onCatalogUpdateCallback: ((items: CatalogItem[]) => void) | null = null;
  private onPeerCountChangeCallback: ((count: number) => void) | null = null;
  private activePeers: Set<string> = new Set();
  private pingInterval: number | null = null;

  constructor() {
    this.senderId = 'tab_' + Math.random().toString(36).substring(2, 9);
    this.initChannel();
  }

  private initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          this.handleChannelMessage(event.data);
        };

        // Broadcast presence
        this.broadcastPing();

        // Periodic heartbeat to count live peers
        this.pingInterval = window.setInterval(() => {
          this.broadcastPing();
        }, 10000);
      } catch (err) {
        console.warn('BroadcastChannel not supported or failed to init:', err);
      }
    }

    // Storage event fallback for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_ACTIVE_QUOTE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (this.onRemoteUpdateCallback) {
              this.onRemoteUpdateCallback(parsed);
            }
          } catch (err) {
            console.error('Failed to parse quote from storage event', err);
          }
        }
      });
    }
  }

  private broadcastPing() {
    if (this.channel) {
      this.channel.postMessage({
        type: 'PING',
        senderId: this.senderId,
        timestamp: Date.now(),
      });
    }
  }

  private handleChannelMessage(msg: SyncMessage) {
    if (!msg || msg.senderId === this.senderId) return;

    if (msg.type === 'PING') {
      this.activePeers.add(msg.senderId);
      if (this.onPeerCountChangeCallback) {
        this.onPeerCountChangeCallback(this.activePeers.size);
      }
      // respond with PONG
      if (this.channel) {
        this.channel.postMessage({
          type: 'PONG',
          senderId: this.senderId,
          timestamp: Date.now(),
        });
      }
    } else if (msg.type === 'PONG') {
      this.activePeers.add(msg.senderId);
      if (this.onPeerCountChangeCallback) {
        this.onPeerCountChangeCallback(this.activePeers.size);
      }
    } else if (msg.type === 'UPDATE_QUOTE' && msg.quote) {
      if (this.onRemoteUpdateCallback) {
        this.onRemoteUpdateCallback(msg.quote);
      }
    } else if (msg.type === 'SYNC_CATALOG' && msg.catalog) {
      if (this.onCatalogUpdateCallback) {
        this.onCatalogUpdateCallback(msg.catalog);
      }
    }
  }

  public broadcastQuoteUpdate(quote: JobQuote) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'UPDATE_QUOTE',
        senderId: this.senderId,
        timestamp: Date.now(),
        quote,
      });
    }
  }

  public broadcastCatalogUpdate(catalog: CatalogItem[]) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'SYNC_CATALOG',
        senderId: this.senderId,
        timestamp: Date.now(),
        catalog,
      });
    }
  }

  public onRemoteUpdate(callback: (quote: JobQuote) => void) {
    this.onRemoteUpdateCallback = callback;
  }

  public onCatalogRemoteUpdate(callback: (catalog: CatalogItem[]) => void) {
    this.onCatalogUpdateCallback = callback;
  }

  public onPeerCountChange(callback: (count: number) => void) {
    this.onPeerCountChangeCallback = callback;
  }

  public getPeerCount(): number {
    return this.activePeers.size;
  }

  public destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }

  // Local Storage Helpers
  public static loadActiveQuote(): JobQuote {
    if (typeof window === 'undefined') return INITIAL_SAMPLE_QUOTE;
    try {
      const data = localStorage.getItem(STORAGE_ACTIVE_QUOTE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading active quote', e);
    }
    return INITIAL_SAMPLE_QUOTE;
  }

  public static saveActiveQuote(quote: JobQuote) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_ACTIVE_QUOTE_KEY, JSON.stringify(quote));
    } catch (e) {
      console.error('Error saving active quote', e);
    }
  }

  public static loadSavedQuotes(): JobQuote[] {
    if (typeof window === 'undefined') return [INITIAL_SAMPLE_QUOTE];
    try {
      const data = localStorage.getItem(STORAGE_SAVED_QUOTES_KEY);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {
      console.error('Error loading saved quotes', e);
    }
    // initialize with sample quote if empty
    return [INITIAL_SAMPLE_QUOTE];
  }

  public static saveQuoteToLibrary(quote: JobQuote): JobQuote[] {
    const quotes = this.loadSavedQuotes();
    const existingIndex = quotes.findIndex((q) => q.quoteNo === quote.quoteNo || q.id === quote.id);
    const updatedQuote = { ...quote, lastModified: Date.now() };

    let newQuotes: JobQuote[];
    if (existingIndex >= 0) {
      newQuotes = [...quotes];
      newQuotes[existingIndex] = updatedQuote;
    } else {
      newQuotes = [updatedQuote, ...quotes];
    }

    try {
      localStorage.setItem(STORAGE_SAVED_QUOTES_KEY, JSON.stringify(newQuotes));
    } catch (e) {
      console.error('Error saving to quotes library', e);
    }
    return newQuotes;
  }

  public static deleteQuoteFromLibrary(idOrQuoteNo: string): JobQuote[] {
    const quotes = this.loadSavedQuotes();
    const newQuotes = quotes.filter((q) => q.id !== idOrQuoteNo && q.quoteNo !== idOrQuoteNo);
    try {
      localStorage.setItem(STORAGE_SAVED_QUOTES_KEY, JSON.stringify(newQuotes));
    } catch (e) {
      console.error('Error deleting from quotes library', e);
    }
    return newQuotes;
  }

  public static loadCompanySettings(): CompanySettings {
    if (typeof window === 'undefined') return DEFAULT_COMPANY_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_COMPANY_KEY);
      if (data) return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading company settings', e);
    }
    return DEFAULT_COMPANY_SETTINGS;
  }

  public static saveCompanySettings(settings: CompanySettings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_COMPANY_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving company settings', e);
    }
  }

  public static loadCatalog(): CatalogItem[] {
    if (typeof window === 'undefined') return COMMON_ELECTRICAL_ITEMS;
    try {
      const data = localStorage.getItem(STORAGE_CUSTOM_CATALOG_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading custom catalog', e);
    }
    return COMMON_ELECTRICAL_ITEMS;
  }

  public static saveCatalog(items: CatalogItem[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_CUSTOM_CATALOG_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving custom catalog', e);
    }
  }

  public static loadTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = localStorage.getItem(STORAGE_THEME_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      console.error('Error loading theme', e);
    }
    return 'dark'; // Matches the dark screenshot default
  }

  public static saveTheme(theme: 'dark' | 'light') {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('bg-slate-50', 'text-slate-900');
        document.body.classList.add('bg-[#0b111e]', 'text-slate-100');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('bg-[#0b111e]', 'text-slate-100');
        document.body.classList.add('bg-slate-50', 'text-slate-900');
      }
    } catch (e) {
      console.error('Error saving theme', e);
    }
  }
}
