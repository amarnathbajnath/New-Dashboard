export interface MaterialItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  sku?: string;
}

export interface MaterialSection {
  id: string;
  name: string;
  items: MaterialItem[];
}

export interface JobQuote {
  id: string;
  quoteNo: string;
  date: string;
  customerName: string;
  address: string;
  phone?: string;
  email?: string;
  markupPercent: number;
  vatPercent: number;
  labourCost: number;
  inspectionCost: number;
  notes: string;
  sections: MaterialSection[];
  currencySymbol: string;
  currencyCode: string;
  lastModified: number;
}

export interface CompanySettings {
  companyName: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  taxRegistrationNo: string;
  defaultMarkupPercent: number;
  defaultVatPercent: number;
  currencySymbol: string;
  currencyCode: string;
  googleSheetsCsvUrl?: string;
}

export interface CatalogItem {
  id?: string;
  category: string;
  description: string;
  unit: string;
  unitCost: number;
  sku?: string;
}

export interface SyncMessage {
  type: 'UPDATE_QUOTE' | 'PING' | 'PONG' | 'REQUEST_STATE' | 'SYNC_CATALOG';
  senderId: string;
  timestamp: number;
  quote?: JobQuote;
  catalog?: CatalogItem[];
}
