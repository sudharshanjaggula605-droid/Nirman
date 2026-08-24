# NIRMAN - Construction Tender Marketplace & Contractor Management Platform

NIRMAN is a commercial-grade construction tender marketplace connecting **Property Owners**, licensed **Contractors**, and **Administrators**.

---

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 14/15 (App Router, TypeScript, React 18/19)
- **Styling & UI**: Tailwind CSS, shadcn/ui primitives, Framer Motion, Lucide Icons, Recharts
- **Database & Services**: Supabase (PostgreSQL, Auth, Storage, Realtime, Row Level Security)
- **Form Validation**: Zod, React Hook Form

---

## 📌 Business Workflow

```text
Owner Registration → Admin Approval → Create Project → Publish Tender (Live on Home Page)
  ↓
Contractors Discover Live Tender → Submit Bid + Itemized BOQ Cost Breakdown
  ↓
Owner Receives Bids → Side-by-Side Comparison Matrix → Accept Winning Contractor
  ↓
Tender Awarded & Project Activated → Milestone Progress Tracking → Milestone Payouts → Project Completed → Rating & Review
```

---

## 🛠️ Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Configure `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 3. Database Initialization

Execute [`supabase/complete_nirman_schema.sql`](file:///c:/Users/J%20Sudharshan/OneDrive/Desktop/Nirman/supabase/complete_nirman_schema.sql) in your Supabase Dashboard **SQL Editor**.

### 4. Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
