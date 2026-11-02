import { CompanySettings, JobQuote } from './types';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'RISHA VISHAL ELECTRICAL',
  subtitle: 'Licensed Electrical Contractors & Engineering Services',
  address: '123 Southern Main Road, Couva, Trinidad & Tobago',
  phone: '+1 (868) 555-0199 / 555-0142',
  email: 'rishavishal.electrical@gmail.com',
  taxRegistrationNo: 'VAT-TT-8932401',
  defaultMarkupPercent: 27.5,
  defaultVatPercent: 12.5,
  currencySymbol: '$',
  currencyCode: 'TTD',
};

export const COMMON_ELECTRICAL_ITEMS = [
  // Distribution & Panels
  { category: 'Distribution', description: '100A 12-Space Main Breaker Panel (Outdoor rated)', unit: 'pcs', unitCost: 850.00 },
  { category: 'Distribution', description: '200A 24-Space Main Lug Loadcenter', unit: 'pcs', unitCost: 1450.00 },
  { category: 'Distribution', description: '20A Single Pole Plug-in Circuit Breaker', unit: 'pcs', unitCost: 48.00 },
  { category: 'Distribution', description: '15A Single Pole Plug-in Circuit Breaker', unit: 'pcs', unitCost: 45.00 },
  { category: 'Distribution', description: '30A Double Pole Breaker (Water Heater/AC)', unit: 'pcs', unitCost: 95.00 },
  { category: 'Distribution', description: '50A Double Pole Breaker (Range/Stove)', unit: 'pcs', unitCost: 125.00 },
  { category: 'Distribution', description: 'Whole House Surge Protective Device (SPD)', unit: 'pcs', unitCost: 420.00 },

  // Conduit & Fittings
  { category: 'Conduit & Fittings', description: '1/2" Schedule 40 PVC Conduit Pipe (10ft)', unit: 'length', unitCost: 22.00 },
  { category: 'Conduit & Fittings', description: '3/4" Schedule 40 PVC Conduit Pipe (10ft)', unit: 'length', unitCost: 28.50 },
  { category: 'Conduit & Fittings', description: '1" Schedule 40 PVC Conduit Pipe (10ft)', unit: 'length', unitCost: 42.00 },
  { category: 'Conduit & Fittings', description: '3/4" Flexible Metallic Conduit (FMC) 100ft roll', unit: 'roll', unitCost: 380.00 },
  { category: 'Conduit & Fittings', description: 'PVC Solvent Cement & Primer (250ml)', unit: 'tin', unitCost: 45.00 },
  { category: 'Conduit & Fittings', description: '3/4" PVC Male Adapters with locknuts', unit: 'pcs', unitCost: 4.50 },
  { category: 'Conduit & Fittings', description: '4x4 Square Metal Junction Box (Deep)', unit: 'pcs', unitCost: 18.00 },

  // Cable & Wire
  { category: 'Cable & Wire', description: '2.5mm² Twin & Earth 600/1000V Cable (100m roll)', unit: 'roll', unitCost: 580.00 },
  { category: 'Cable & Wire', description: '1.5mm² Twin & Earth Lighting Cable (100m roll)', unit: 'roll', unitCost: 420.00 },
  { category: 'Cable & Wire', description: '6.0mm² Twin & Earth Heavy Appliance Cable (100m roll)', unit: 'roll', unitCost: 1150.00 },
  { category: 'Cable & Wire', description: '10.0mm² Main Service Feeder Cable (per meter)', unit: 'm', unitCost: 35.00 },
  { category: 'Cable & Wire', description: 'Cat6 UTP Solid Copper Network Cable (305m box)', unit: 'box', unitCost: 650.00 },

  // Devices & Outlets
  { category: 'Devices & Outlets', description: '15A 125V Tamper Resistant Duplex Receptacle', unit: 'pcs', unitCost: 24.00 },
  { category: 'Devices & Outlets', description: '20A 125V Weatherproof GFCI Receptacle', unit: 'pcs', unitCost: 115.00 },
  { category: 'Devices & Outlets', description: 'Single Gang 1-Way Rocker Light Switch', unit: 'pcs', unitCost: 18.50 },
  { category: 'Devices & Outlets', description: 'Single Gang 2-Way Light Switch (Stairway)', unit: 'pcs', unitCost: 26.00 },
  { category: 'Devices & Outlets', description: 'Rotary/Slide LED Universal Dimmer Switch', unit: 'pcs', unitCost: 95.00 },
  { category: 'Devices & Outlets', description: 'Heavy Duty 45A Cooker Switch with Neon Indicator', unit: 'pcs', unitCost: 85.00 },

  // Lighting & Fixtures
  { category: 'Lighting & Fixtures', description: '12W Round LED Recessed Downlight 3000K/4000K', unit: 'pcs', unitCost: 55.00 },
  { category: 'Lighting & Fixtures', description: '4ft 36W Integrated LED Weatherproof Batten Fitting', unit: 'pcs', unitCost: 145.00 },
  { category: 'Lighting & Fixtures', description: '50W Exterior Outdoor LED Flood Light with Sensor', unit: 'pcs', unitCost: 220.00 },
  { category: 'Lighting & Fixtures', description: 'Emergency Exit Light Fitting with Battery Backup', unit: 'pcs', unitCost: 195.00 },

  // Earthing & Safety
  { category: 'Earthing & Safety', description: '5/8" x 8ft Copper Clad Ground Rod', unit: 'pcs', unitCost: 165.00 },
  { category: 'Earthing & Safety', description: 'Heavy Duty Ground Rod Brass Clamp', unit: 'pcs', unitCost: 28.00 },
  { category: 'Earthing & Safety', description: '16mm² Bare Copper Earthing Conductor (per meter)', unit: 'm', unitCost: 22.00 },
  { category: 'Earthing & Safety', description: 'Earth Inspection Chamber & Cover (PVC)', unit: 'pcs', unitCost: 85.00 },
];

export const INITIAL_SAMPLE_QUOTE: JobQuote = {
  id: 'quote-sample-001',
  quoteNo: 'Q-2026-001',
  date: new Date().toISOString().split('T')[0],
  customerName: 'John Smith',
  address: '123 Main Road, Port of Spain',
  phone: '+1 (868) 555-7821',
  email: 'jsmith@example.com',
  markupPercent: 27.5,
  vatPercent: 12.5,
  labourCost: 1250.00,
  inspectionCost: 350.00,
  notes: 'Complete rewiring of ground floor kitchen and utility area. Includes installation of dedicated 30A circuit for induction cooktop, 6 recessed LED downlights, and electrical safety inspection certificate upon completion.',
  currencySymbol: '$',
  currencyCode: 'TTD',
  lastModified: Date.now(),
  sections: [
    {
      id: 'sec-1',
      name: 'Distribution & Circuit Protection',
      items: [
        {
          id: 'item-1-1',
          description: '100A 12-Space Main Breaker Panel',
          quantity: 1,
          unit: 'pcs',
          unitCost: 850.00,
          sku: 'PNL-100A',
        },
        {
          id: 'item-1-2',
          description: '20A Single Pole Plug-in Circuit Breaker',
          quantity: 4,
          unit: 'pcs',
          unitCost: 48.00,
          sku: 'BRK-20A-SP',
        },
        {
          id: 'item-1-3',
          description: '30A Double Pole Breaker (Appliance Circuit)',
          quantity: 1,
          unit: 'pcs',
          unitCost: 95.00,
          sku: 'BRK-30A-DP',
        },
      ],
    },
    {
      id: 'sec-2',
      name: 'Conduit, Wiring & Rough-in',
      items: [
        {
          id: 'item-2-1',
          description: '3/4" Schedule 40 PVC Conduit Pipe (10ft)',
          quantity: 12,
          unit: 'length',
          unitCost: 28.50,
          sku: 'CND-PVC-34',
        },
        {
          id: 'item-2-2',
          description: '2.5mm² Twin & Earth 600/1000V Cable (100m roll)',
          quantity: 2,
          unit: 'roll',
          unitCost: 580.00,
          sku: 'CBL-2.5TE',
        },
        {
          id: 'item-2-3',
          description: '4x4 Square Metal Junction Box (Deep)',
          quantity: 8,
          unit: 'pcs',
          unitCost: 18.00,
          sku: 'BOX-4X4-MTL',
        },
      ],
    },
    {
      id: 'sec-3',
      name: 'Fixtures, Outlets & Finish Trim',
      items: [
        {
          id: 'item-3-1',
          description: '12W Round LED Recessed Downlight 3000K',
          quantity: 6,
          unit: 'pcs',
          unitCost: 55.00,
          sku: 'LGT-LED-12W',
        },
        {
          id: 'item-3-2',
          description: '20A 125V Weatherproof GFCI Receptacle',
          quantity: 3,
          unit: 'pcs',
          unitCost: 115.00,
          sku: 'DEV-GFCI-20A',
        },
        {
          id: 'item-3-3',
          description: 'Single Gang 1-Way Rocker Light Switch',
          quantity: 4,
          unit: 'pcs',
          unitCost: 18.50,
          sku: 'SW-1WAY-ROC',
        },
      ],
    },
  ],
};

export const BLANK_QUOTE: JobQuote = {
  id: '',
  quoteNo: 'Q-2026-001',
  date: new Date().toISOString().split('T')[0],
  customerName: '',
  address: '',
  phone: '',
  email: '',
  markupPercent: 27.5,
  vatPercent: 12.5,
  labourCost: 0.00,
  inspectionCost: 0.00,
  notes: '',
  currencySymbol: '$',
  currencyCode: 'TTD',
  lastModified: Date.now(),
  sections: [],
};
