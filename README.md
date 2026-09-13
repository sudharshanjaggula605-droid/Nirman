# NIRMAN v2.1.0 — Construction Tender Marketplace & Contractor Management Platform

NIRMAN is a commercial-grade construction tender marketplace connecting **Property Owners**, licensed **Contractors**, and **Administrators**.

> **✨ What's New in v2.1.0:**
> - **NIRMAN Saathi (निर्माँ साथी)**: Voice-first and visual interactive assistant built specifically for non-technical or uneducated users with speech recognition, text-to-speech audio read-aloud, and one-tap action chips.
> - **Interactive Application Tour**: A 5-step interactive walkthrough guiding users through live tenders, easy BOQ bidding, milestone escrow security, and platform features with audio voice guides.

---

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router, TypeScript, React 18)
- **Styling & UI**: Tailwind CSS, shadcn/ui primitives, Framer Motion, Lucide Icons, Recharts
- **Accessibility & AI**: Web Speech Recognition (Voice Input), Web SpeechSynthesis (Voice Output), Interactive Guided Tour
- **Database & Services**: Supabase (PostgreSQL, Auth, Storage, Realtime, Row Level Security)
- **Payments & Escrow**: Razorpay Gateway (HMAC-SHA256 Webhook Verification, Milestone Payouts)
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
