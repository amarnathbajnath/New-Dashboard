import { CatalogItem } from '../types';
import { parseCatalogCsv } from './csvParser';
import { DEFAULT_GOOGLE_SHEETS_CSV_URL } from '../constants';

export interface FetchCatalogResult {
  items: CatalogItem[];
  source: 'google_sheets_live' | 'offline_bundle' | 'local_cache';
  count: number;
  error?: string;
}

export async function fetchCatalogFromGoogleSheets(
  csvUrl: string = DEFAULT_GOOGLE_SHEETS_CSV_URL
): Promise<FetchCatalogResult> {
  const targetUrl = csvUrl.trim() || DEFAULT_GOOGLE_SHEETS_CSV_URL;

  try {
    // Attempt fetch from live Google Sheets with a 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
      cache: 'no-cache', // always fetch fresh live prices from Google Sheets
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const csvText = await response.text();
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Google Sheets returned an empty CSV.');
    }

    const items = parseCatalogCsv(csvText);
    return {
      items,
      source: 'google_sheets_live',
      count: items.length,
    };
  } catch (liveErr: any) {
    console.warn('Could not fetch live Google Sheets CSV, attempting bundled fallback:', liveErr);

    // Fallback: try loading the bundled offline CSV file
    try {
      const fallbackResponse = await fetch('./default_catalog.csv');
      if (fallbackResponse.ok) {
        const fallbackText = await fallbackResponse.text();
        const fallbackItems = parseCatalogCsv(fallbackText);
        return {
          items: fallbackItems,
          source: 'offline_bundle',
          count: fallbackItems.length,
          error: liveErr.message || 'Offline mode: using bundled catalog',
        };
      }
    } catch (bundleErr) {
      console.warn('Could not load bundled default_catalog.csv:', bundleErr);
    }

    throw liveErr;
  }
}
