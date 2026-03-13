# 💰 Paisa — Smart Business Finance App

> A production-ready React Native (Expo) mobile application for small business financial management — GST invoices, quotations, sales tracking, and analytics.

---

## 📁 Project Structure

```
paisa/
├── App.tsx                          # Root entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── babel.config.js
├── eas.json                         # EAS Build config
│
├── assets/
│   ├── icon.png                     # App icon (1024×1024)
│   ├── splash.png                   # Splash screen
│   └── adaptive-icon.png            # Android adaptive icon
│
├── src/
│   ├── theme/
│   │   └── colors.ts                # Design tokens (colors, spacing, typography)
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   │
│   ├── database/
│   │   └── database.ts              # SQLite layer (all CRUD operations)
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navigation configuration
│   │
│   ├── utils/
│   │   └── pdfGenerator.ts          # HTML templates + expo-print PDF export
│   │
│   ├── components/
│   │   └── UIComponents.tsx         # Shared reusable components
│   │
│   └── screens/
│       ├── SetupScreen.tsx          # First-launch business setup (3 steps)
│       ├── DashboardScreen.tsx      # KPIs, charts, quick actions
│       ├── InvoicesScreen.tsx       # Invoice list with filter/search
│       ├── CreateInvoiceScreen.tsx  # GST invoice builder with line items
│       ├── ViewInvoiceScreen.tsx    # Invoice detail + PDF export
│       ├── QuotationsScreen.tsx     # Quotation list
│       ├── CreateQuotationScreen.tsx# Quotation builder
│       ├── ViewQuotationScreen.tsx  # Quotation detail + PDF export
│       ├── SalesScreen.tsx          # Sales transaction tracker
│       ├── ReportsScreen.tsx        # Analytics with charts
│       └── SettingsScreen.tsx       # Business info + app settings
│
└── backend/
    ├── package.json
    ├── server.js                    # Express API server
    ├── routes/
    └── middleware/
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for APK build) or Expo Go app (for testing)
- EAS CLI for production builds (`npm install -g eas-cli`)

---

### Step 1 — Install App Dependencies

```bash
cd paisa
npm install
```

### Step 2 — Start Development Server

```bash
npx expo start
```

Then scan the QR code with **Expo Go** (Android/iOS) to run instantly on your device.

---

### Step 3 — Run Backend API (Optional)

```bash
cd backend
npm install
node server.js
```

Backend runs at: `http://localhost:3000`

---

## 📱 Running on Android Device/Emulator

```bash
# Start with Android target
npx expo start --android

# Or run directly on connected device (USB debugging enabled)
npx expo run:android
```

---

## 📦 Building the APK

### Option A — Expo EAS Build (Recommended)

```bash
# 1. Login to your Expo account
npx eas login

# 2. Configure project (first time)
npx eas build:configure

# 3. Build a preview APK (for testing — direct install)
npx eas build --platform android --profile preview

# 4. Build a production AAB (for Play Store)
npx eas build --platform android --profile production
```

The build will be available to download from: https://expo.dev

### Option B — Local APK Build (No EAS Account)

```bash
# Install Android build dependencies
npx expo prebuild --platform android

# Build debug APK locally
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Option C — Expo Standalone (Classic Build — legacy)

```bash
expo build:android -t apk
```

---

## ⚙️ EAS Build Configuration

Create `eas.json` (already included):

```json
{
  "cli": { "version": ">= 5.9.1" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🗄️ Database Schema

All data is stored locally on the device using **expo-sqlite**.

```sql
-- Business info (single row)
CREATE TABLE business (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  pan_number TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  signatory_name TEXT NOT NULL,
  terms_conditions TEXT,
  logo_uri TEXT,
  created_at TEXT
);

-- GST Invoices
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,   -- INV-0001, INV-0002...
  date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT,
  customer_state TEXT,
  customer_gstin TEXT,
  payment_mode TEXT NOT NULL,
  gst_rate REAL DEFAULT 18,
  subtotal REAL NOT NULL,
  cgst REAL NOT NULL,
  sgst REAL NOT NULL,
  grand_total REAL NOT NULL,
  status TEXT DEFAULT 'draft',           -- draft|sent|paid|overdue
  notes TEXT,
  created_at TEXT
);

-- Invoice line items
CREATE TABLE invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hsn_code TEXT,
  quantity REAL NOT NULL,
  rate REAL NOT NULL,
  amount REAL NOT NULL                   -- quantity × rate
);

-- Quotations
CREATE TABLE quotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quotation_number TEXT UNIQUE NOT NULL, -- QT-0001, QT-0002...
  date TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_email TEXT,
  project_description TEXT,
  subtotal REAL NOT NULL,
  tax_rate REAL DEFAULT 18,
  tax_amount REAL NOT NULL,
  other_charges REAL DEFAULT 0,
  final_total REAL NOT NULL,
  status TEXT DEFAULT 'draft',           -- draft|sent|accepted|rejected|expired
  notes TEXT,
  created_at TEXT
);

-- Quotation line items
CREATE TABLE quotation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  price REAL NOT NULL,
  total REAL NOT NULL                    -- quantity × price
);

-- Direct sales transactions
CREATE TABLE sales_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  created_at TEXT
);
```

---

## 🌐 Backend API Reference

Base URL: `http://your-server:3000`

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| GET    | /health             | Health check                 |
| GET    | /getInvoices        | List all invoices            |
| GET    | /getInvoice/:id     | Single invoice with items    |
| POST   | /createInvoice      | Create invoice + items       |
| PUT    | /updateInvoice/:id  | Update invoice status        |
| GET    | /getQuotations      | List all quotations          |
| POST   | /createQuotation    | Create quotation             |
| GET    | /getSales           | List sales transactions      |
| POST   | /createSale         | Record a sale                |
| GET    | /getReports         | Analytics summary            |
| POST   | /sync               | Bulk sync from device        |

### Example — Create Invoice

```http
POST /createInvoice
Content-Type: application/json

{
  "invoice": {
    "invoiceNumber": "INV-0001",
    "date": "2025-01-15",
    "dueDate": "2025-02-14",
    "customerName": "ABC Enterprises",
    "customerAddress": "123 MG Road, Bangalore",
    "customerGstin": "29AABCU9603R1ZX",
    "paymentMode": "Bank Transfer",
    "gstRate": 18,
    "subtotal": 10000,
    "cgst": 900,
    "sgst": 900,
    "grandTotal": 11800,
    "status": "sent"
  },
  "items": [
    {
      "description": "Web Development Services",
      "hsnCode": "998314",
      "quantity": 1,
      "rate": 10000,
      "amount": 10000
    }
  ]
}
```

---

## 💡 GST Calculation Logic

```
amount        = quantity × rate
subtotal      = sum(item.amount for all items)
cgst          = subtotal × (gstRate / 2 / 100)
sgst          = subtotal × (gstRate / 2 / 100)
grand_total   = subtotal + cgst + sgst
```

Supported GST rates: 0%, 5%, 12%, 18%, 28%

---

## 📄 PDF Generation

PDFs are generated using **expo-print** from HTML templates.

```typescript
// Generate and share PDF
import { exportInvoicePDF } from './src/utils/pdfGenerator';

await exportInvoicePDF(invoice, business);
// Opens native share sheet — WhatsApp, Email, Drive, etc.
```

PDF features:
- ✅ Pixel-perfect GST invoice layout (A4)
- ✅ Business letterhead with GSTIN/PAN
- ✅ Itemised table with HSN codes
- ✅ CGST/SGST tax split
- ✅ Amount in words (Indian numbering)
- ✅ Authorized signatory section
- ✅ Terms & conditions
- ✅ No external branding

---

## 🎨 Design System

The app uses a deep navy fintech theme with an emerald-teal accent.

```typescript
// Theme tokens (src/theme/colors.ts)
Colors.primary     = '#0A1628'  // Deep navy
Colors.accent      = '#00D4AA'  // Emerald teal
Colors.secondary   = '#F5A623'  // Amber (quotations)
Colors.background  = '#F0F4F8'  // Off-white
Colors.success     = '#27AE60'
Colors.error       = '#E74C3C'
Colors.warning     = '#F5A623'
```

---

## 🔑 Key Features Summary

| Feature | Status |
|---------|--------|
| First-launch 3-step setup | ✅ |
| GST Invoice Generator (INV-XXXX) | ✅ |
| Quotation Generator (QT-XXXX) | ✅ |
| PDF export & share (WhatsApp/Email) | ✅ |
| SQLite local database | ✅ |
| Dashboard with KPIs | ✅ |
| Revenue charts (Line + Bar + Pie) | ✅ |
| Sales transaction tracking | ✅ |
| Search & filter invoices | ✅ |
| Invoice status management | ✅ |
| Settings & business info edit | ✅ |
| Node.js Express backend | ✅ |
| Offline-first (no internet required) | ✅ |
| Responsive (phone + tablet) | ✅ |

---

## 📲 Supported Android Versions

- Android 5.0 (API 21) and above
- Supports phones and tablets

---

## 🛠️ Troubleshooting

**`expo-sqlite` errors:**
```bash
npx expo install expo-sqlite
```

**PDF not generating:**
```bash
npx expo install expo-print expo-sharing
```

**Metro bundler cache issues:**
```bash
npx expo start --clear
```

**Android build fails:**
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

---

## 📜 License

MIT License — Free for personal and commercial use.

---

*Built with ❤️ using React Native, Expo, SQLite & TypeScript*
