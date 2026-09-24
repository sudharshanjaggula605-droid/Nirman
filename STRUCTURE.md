# NIRMAN — Project Structure Guide

> **Version 2.1** | Next.js 14 + Supabase Full-Stack Application

---

## Overview

NIRMAN is a **single Next.js full-stack application** organized using the official
src/ directory convention (https://nextjs.org/docs/app/getting-started/project-structure).

Within src/, the source code is logically separated into:

- **src/app/**      — Next.js App Router (pages, layouts, API routes)
- **src/frontend/** — UI components, client-side utilities, styling
- **src/backend/**  — Server Actions, server-side libraries, service integrations
- **src/shared/**   — Types and utilities shared between frontend and backend

---

## Full Project Structure

`
Nirman/
│
├── src/                             All application source code
│   ├── app/                         Next.js App Router (routing core)
│   │   ├── api/payments/            Payment gateway API Route Handlers
│   │   ├── admin/                   Admin dashboard pages
│   │   ├── owner/                   Owner dashboard pages
│   │   ├── contractor/              Contractor dashboard pages
│   │   ├── login/                   Login page
│   │   ├── register/                Registration page
│   │   ├── tenders/                 Public tender listing
│   │   ├── layout.tsx               Root layout
│   │   ├── page.tsx                 Landing page
│   │   ├── globals.css              Global CSS styles
│   │   └── ...
│   │
│   ├── frontend/                    Frontend-specific code
│   │   ├── components/              Reusable UI components
│   │   │   ├── admin/               Admin-specific UI components
│   │   │   ├── dashboard/           Dashboard layout components
│   │   │   │   ├── admin-sidebar.tsx
│   │   │   │   ├── owner-sidebar.tsx
│   │   │   │   ├── contractor-sidebar.tsx
│   │   │   │   ├── dashboard-header.tsx
│   │   │   │   └── logout-modal.tsx
│   │   │   ├── payments/            Payment UI modals
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── ...
│   │   │
│   │   └── lib/                     Client-side utilities
│   │       ├── supabase/client.ts   Supabase browser client
│   │       ├── i18n/                Internationalization (multi-language)
│   │       └── utils.ts             Formatting utilities (cn, formatCurrency, etc.)
│   │
│   ├── backend/                     Server-side code
│   │   ├── actions/                 Next.js Server Actions ("use server")
│   │   │   ├── auth.ts              Login, register, logout
│   │   │   ├── admin.ts             Admin management
│   │   │   ├── bids.ts              Bid management
│   │   │   ├── messages.ts          Messaging
│   │   │   ├── notifications.ts     Notifications
│   │   │   ├── payments.ts          Razorpay payment processing
│   │   │   ├── projects.ts          Project creation
│   │   │   ├── search.ts            Search
│   │   │   ├── support.ts           Support requests
│   │   │   ├── tenders.ts           Tender management
│   │   │   └── user-settings.ts     Profile updates
│   │   │
│   │   └── lib/                     Server-only utilities
│   │       ├── supabase/server.ts   Supabase server client (SSR)
│   │       ├── supabase/admin.ts    Supabase admin client (service role)
│   │       ├── notifications/       WhatsApp + Email delivery
│   │       ├── validations/         Zod validation schemas
│   │       ├── razorpay.ts          Razorpay integration
│   │       └── errors.ts            Error sanitization
│   │
│   └── shared/                      Shared between frontend and backend
│       └── types/index.ts           All TypeScript interfaces and types
│
├── public/                          Static assets (images, favicon, logo)
├── supabase/                        Database migrations and schema SQL
├── docs/                            Reports and documentation
│   ├── lighthouse/                  Lighthouse performance reports (JSON)
│   └── qa/                          QA test reports (Excel)
├── test_evidence/                   Test screenshots and results
├── scripts/                         Dev and test utility scripts
├── venv/                            Python venv (for scripts only, not the app)
│
├── .env.local                       Environment variables (never commit)
├── .env.example                     Environment variable template
├── middleware.ts                    Auth protection (MUST stay at root)
├── next.config.js                   Next.js configuration
├── tsconfig.json                    TypeScript config (@ -> src/)
├── tailwind.config.js               Tailwind CSS config
├── package.json                     Dependencies
└── README.md                        Project overview
`

---

## Import Path Alias

The @/ alias maps to src/ (configured in tsconfig.json):

`	ypescript
// Frontend
import { cn, formatCurrency } from "@/frontend/lib/utils";
import { createClient } from "@/frontend/lib/supabase/client";
import { useLanguage } from "@/frontend/lib/i18n/language-context";
import Navbar from "@/frontend/components/navbar";

// Backend
import { loginAction } from "@/backend/actions/auth";
import { createClient } from "@/backend/lib/supabase/server";
import { createAdminClient } from "@/backend/lib/supabase/admin";

// Shared types
import type { Tender, Profile, Bid } from "@/shared/types";
`

---

## Running the Application

`ash
npm run dev       # Development server
npm run build     # Production build
npm start         # Start production server
npm run lint      # Lint
`

---

## Important Notes

1. middleware.ts **must stay at the project root** - Next.js requires it there.
2. src/backend/lib/supabase/admin.ts uses SUPABASE_SERVICE_ROLE_KEY - NEVER import it in client components.
3. public/ stays at root - Next.js serves static files from there directly.
4. 
ode_modules/ and .next/ stay at root - do not move these.
