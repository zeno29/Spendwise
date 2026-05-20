# SpendWise — Smart Personal Finance & Ledger Dashboard

SpendWise is a high-fidelity, premium personal finance single-page application built using React Native Web and Expo. Featuring a sleek, velvet dark-theme interface, it integrates real-time cloud data synchronization, row-level secure database states, a dynamic multi-currency profiles engine, and smart natural-language transaction parsing.

---

## Key Capabilities & Features

### 🌌 Visual Design & Premium Aesthetics
- **Velvet Glow Dark Mode**: Designed using custom color palettes, glassmorphic card boundaries, glowing status badges, and transition micro-animations.
- **Dynamic SVGs**: Custom vector donut chart diagrams representing expense ratios and smooth continuous trend-line sparklines showing wallet history.

### 💱 Multi-Currency Profiles Engine
- **Profile Synchronization**: New users are gated by a detailed **Setup Wizard** to configure their Name, active base currency, and initial bankroll.
- **Dynamic Formatting**: Supports seamless toggling between **USD ($), EUR (€), GBP (£), INR (₹), and JPY (¥)**. Switching the profile instantly formats, localizes, and dynamically updates all balances, smart parsing previews, budget limit dials, and transactions.
- **Persistent Header Settings**: Quick-access Settings Gear located right in the dashboard header allows users to modify profile details at any point.

### 🧠 Smart Natural Language Ledger (NLP)
- **Zero-Click Transactions**: Write natural statements like `"Spent €12.50 at Starbucks"` or `"Received £450 from Freelance Web Design"`.
- **Context-Aware Parsing**: Automatically extracts transaction amounts, infers type (income/expense), maps words to target ledger categories (Food, Shopping, utilities, etc.), and generates capitalized merchant titles in a live preview card before confirming.

### ☁️ Cloud Persistence & Guest Mode
- **Supabase Backend**: Configured with Row-Level Security (RLS) PostgreSQL schemas to store profiles, transaction ledger lists, and monthly category budgets.
- **Offline Guest Bypass**: Recruiters and reviewers can bypass cloud setup instantly to preview the complete visual dashboard using mocked local storage data.

---

## Project Structure

```text
spendwise/
├── App.tsx                 # Core app bootstrap, auth visual gates & main shell layout
├── app.json                # Expo build configurations & baseUrl router experiments
├── package.json            # Node scripts, packages, and gh-pages deployment configurations
├── assets/                 # Icons, splash backgrounds, and static media files
└── src/
    ├── components/
    │   ├── AuthScreen.tsx       # Supabase Cloud Login, Registration, & Guest Mode logic
    │   ├── OnboardingScreen.tsx # Setup Wizard & Profile Update Settings form
    │   ├── SmartForm.tsx        # NLP input bar, real-time feedback preview, and manual inputs
    │   ├── SummaryCards.tsx     # Dynamic balance, income, expense, and fund cards
    │   ├── BudgetLimits.tsx     # Interactive, color-coded visual budget limit gauges
    │   ├── DonutChart.tsx       # Expense-by-category visual distribution SVG
    │   ├── TrendChart.tsx       # Sparkline historic balance timeline SVG
    │   └── TransactionList.tsx  # Interactive transaction ledger list with swipe/remove actions
    ├── store/
    │   └── useFinanceStore.ts   # Zustand unified state management (Auth, Profiles, Ledger, Sync)
    ├── styles/
    │   └── theme.ts             # Harmonious violet theme style tokens, sizing, and fonts
    └── utils/
        ├── aiParser.ts          # Natural-language parsing algorithms & stopword cleanups
        └── supabase.ts          # Supabase Client initialization & storage persistence
```

---

## Technical Architecture Stack

1. **Framework**: React Native Web & Expo for a native look-and-feel compiled directly to the browser.
2. **State Management**: **Zustand** store configured with storage persistence middlewares for lightning-fast state updates and state-restoration.
3. **Database & Auth**: **Supabase** (PostgreSQL) backend using Row-Level Security policies to keep records secure and isolated.
4. **Drawing**: Native drawing components compiled into SVGs via `react-native-svg` to ensure high performance and fluid rendering in both mobile and desktop screens.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v20+ recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend Credentials
Create/edit `.env` or customize the client keys inside `src/utils/supabase.ts` with your Supabase credentials:
```typescript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Run Development Server
```bash
npm run web
```
This boots up the local Metro developer server, typically hosted at [http://localhost:8081](http://localhost:8081).

---

## How to Deploy to GitHub Pages

This project is pre-configured for automated deployment to GitHub Pages via the `gh-pages` script wrapper:

### 1. Create a Repository
Create a new repository on your GitHub account named **`spendwise`**.

### 2. Link Local Git Remote
If not already linked, initialize your local repository and configure the remote URL:
```bash
git init
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/spendwise.git
```

### 3. Update Configuration (If Repo Name is Different)
If your repository is named something else, edit the `baseUrl` in `app.json` to match:
```json
"experiments": {
  "baseUrl": "/YOUR_REPOS_NAME"
}
```

### 4. Deploy Automatically
Run the deploy script:
```bash
npm run deploy
```
This single command automatically compiles the Expo app for web and pushes the resulting static `dist` bundle to the `gh-pages` branch on your GitHub repository!

### 5. Finalize Settings on GitHub
1. Go to your repository settings page on GitHub.
2. Click on the **Pages** tab on the left navigation bar.
3. Under **Build and deployment**, verify the branch is set to `gh-pages`.
4. Your application will be live at `https://YOUR_GITHUB_USERNAME.github.io/spendwise/`!
