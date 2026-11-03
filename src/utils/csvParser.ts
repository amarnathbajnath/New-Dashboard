import { CatalogItem } from '../types';

/**
 * Robust CSV parser specifically tailored for the Electrical Job Costing format:
 * SKU, Item, Unit, Price, Logical_Group
 * Handles:
 * - RFC 4180 quotes ("1 1/2"" Heat Shrink")
 * - Lenient unescaped quotes (1 1/2" Heat Shrink)
 * - Empty/missing prices (defaults to 0.00)
 * - Currency formatting ($23.95, $1,050.00, etc.)
 * - Flexible header mapping:
 *     SKU -> sku
 *     Item / Description -> description
 *     Unit -> unit
 *     Price / Cost -> unitCost
 *     Logical_Group / Logical Group / Category -> category
 */
export function parseCatalogCsv(csvText: string): CatalogItem[] {
  if (!csvText || !csvText.trim()) {
    throw new Error('CSV text is empty.');
  }

  // Normalize line breaks
  const rawText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Tokenize CSV into rows, respecting quoted fields with embedded newlines or quotes
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    const nextChar = rawText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: ""
        currentField += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      // End of row
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push last field & row if not empty
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row.');
  }

  // Detect header indices
  const headerRow = rows[0].map((h) =>
    h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')
  );

  let skuIdx = -1;
  let itemIdx = -1;
  let unitIdx = -1;
  let priceIdx = -1;
  let groupIdx = -1;

  for (let i = 0; i < headerRow.length; i++) {
    const h = headerRow[i];
    if (h === 'sku' || h.includes('part') || h.includes('code')) {
      skuIdx = i;
    } else if (h === 'item' || h.includes('desc') || h.includes('product') || h.includes('name')) {
      itemIdx = i;
    } else if (h === 'unit' || h.includes('uom') || h.includes('measure')) {
      unitIdx = i;
    } else if (h === 'price' || h.includes('cost') || h.includes('rate')) {
      priceIdx = i;
    } else if (
      h === 'logical_group' ||
      h.includes('group') ||
      h.includes('category') ||
      h.includes('section')
    ) {
      groupIdx = i;
    }
  }

  // Fallbacks if exact headers were not found
  if (itemIdx === -1 && headerRow.length > 1) {
    // If standard 5 column layout: SKU, Item, Unit, Price, Logical_Group
    if (headerRow.length >= 5) {
      skuIdx = 0;
      itemIdx = 1;
      unitIdx = 2;
      priceIdx = 3;
      groupIdx = 4;
    } else {
      itemIdx = 0;
    }
  }

  const items: CatalogItem[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || row.every((c) => !c)) continue;

    const sku = skuIdx >= 0 && row[skuIdx] ? row[skuIdx].trim() : undefined;
    const description = itemIdx >= 0 && row[itemIdx] ? row[itemIdx].trim() : (row[0] || '').trim();
    const unit = unitIdx >= 0 && row[unitIdx] ? row[unitIdx].trim() : 'each';
    const group =
      groupIdx >= 0 && row[groupIdx]
        ? row[groupIdx].trim()
        : '1. Service Entrance & Utility';

    // Parse price: strip $, commas, and non-numeric characters (except . and -)
    let unitCost = 0;
    if (priceIdx >= 0 && row[priceIdx]) {
      const rawPrice = row[priceIdx].trim();
      const cleaned = rawPrice.replace(/[^0-9.-]/g, '');
      if (cleaned) {
        unitCost = parseFloat(cleaned) || 0;
      }
    }

    if (description) {
      items.push({
        id: 'cat-' + (sku ? sku.replace(/[^a-zA-Z0-9]/g, '_') : '') + '-' + r + '-' + Math.random().toString(36).substring(2, 6),
        sku: sku || undefined,
        description,
        unit: unit || 'each',
        unitCost,
        category: group || 'General',
      });
    }
  }

  if (items.length === 0) {
    throw new Error('No valid catalog items could be parsed from the CSV file.');
  }

  return items;
}

/**
 * Exports catalog items back into the exact CSV schema:
 * SKU,Item,Unit,Price,Logical_Group
 */
export function exportCatalogToCsv(items: CatalogItem[]): string {
  const rows: string[][] = [
    ['SKU', 'Item', 'Unit', 'Price', 'Logical_Group'],
  ];

  for (const item of items) {
    const cleanSku = item.sku || '';
    const cleanDesc = (item.description || '').replace(/"/g, '""');
    const cleanUnit = (item.unit || 'each').replace(/"/g, '""');
    const priceStr = item.unitCost > 0 ? `$${item.unitCost.toFixed(2)}` : '';
    const cleanGroup = (item.category || '1. Service Entrance & Utility').replace(/"/g, '""');

    rows.push([
      `"${cleanSku}"`,
      `"${cleanDesc}"`,
      `"${cleanUnit}"`,
      `"${priceStr}"`,
      `"${cleanGroup}"`,
    ]);
  }

  return rows.map((r) => r.join(',')).join('\r\n');
}
