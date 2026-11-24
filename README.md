# 🪔 MAKE A WISH • A Seven-Day Positive Reflection Journey

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Storage-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-₹10%20Payments-0C2340?logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

A peaceful, spiritually grounded, premium full-stack web sanctuary where users contribute **₹10** once to submit a sacred wish through written text or an encrypted voice recording of up to 3 minutes (180 seconds). Rather than making false supernatural promises that wishes will magically come true, **MAKE A WISH** anchors each wish in a transformative **Seven-Day Positive Reflection Journey** designed to cultivate patience, inner strength, mindful action, and gratitude.

---

## 🌟 Key Features

- **Cinematic Spiritual Atmosphere**: Deep midnight purple, radiant gold, warm cream, temple-inspired aesthetics, glowing SVG Diya lamps with realistic flicker, and floating golden canvas particles with `prefers-reduced-motion` accessibility.
- **Ambient Sound Synthesizer**: Web Audio API meditative tanpura/Om drone (136.1 Hz + sacred harmonics) with animated soundwave visualizer and resonant Tibetan singing bowl chime upon wish submission (muted by default).
- **3-Minute Voice Recording**: Browser `MediaRecorder` API supporting `audio/webm;codecs=opus`, MP4 and OGG fallbacks, real-time audio waveform visualizer via `AnalyserNode`, countdown timer, playback scrubber, delete and re-record controls.
- **₹10 Payment-Gated Security**: Server-side Razorpay order generation and cryptographic HMAC-SHA256 signature verification. Enforces strict single-use idempotency (1 verified payment = exactly 1 registered wish).
- **Private Audio Storage**: Voice notes are uploaded directly to a private Supabase Storage bucket (`wish-voice-notes`). Audio is never publicly exposed; authorized playback uses time-limited signed URLs.
- **Seven-Day Reflection Journey**: Unlocks Day 1 immediately and provides daily guidance, affirmations, and mindful micro-actions for Days 2–7. Easily accessible via unique Reference ID (e.g., `WISH-4192-2026`) and secret 6-digit PIN.
- **Full Multilingual i18n (6 Languages)**: Complete translations for **English**, **Tamil (தமிழ்)**, **Hindi (हिन्दी)**, **Telugu (తెలుగు)**, **Malayalam (മലയാളം)**, and **Kannada (ಕನ್ನಡ)** with language detection and persistent preferences.
- **Sacred Anonymous Community Wall**: Public anonymous wishes displayed only after human moderation. Visitors can light virtual Diyas to send peaceful blessings to fellow travelers.
- **Comprehensive Admin Dashboard (`/admin`)**:
  - Secure authentication via Supabase Auth and `is_admin()` database role verification.
  - Analytics overview (Total Wishes, Verified Payments, ₹ Gross Revenue, Pending Moderation, Language Distribution, Daily Submission Chart).
  - Searchable and filterable wish repository with text inspection, signed URL voice note playback, content moderation (Approve / Reject), permanent deletion, and payment ledger.
  - One-click CSV export of all audit records.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User([User]) -->|1. Opens App & Selects Language| UI[React 18 + Vite UI]
    UI -->|2. Writes Text or Records Voice <= 180s| Voice[MediaRecorder & Audio Visualizer]
    UI -->|3. Selects Private or Anonymous| Form[Wish Submission Form]
    Form -->|4. Initiates ₹10 Payment| EdgeCreate[Edge Function: create-razorpay-order]
    EdgeCreate -->|Creates Order| RZP[(Razorpay Gateway)]
    RZP -->|Returns Order ID| UI
    UI -->|5. Opens Razorpay Checkout| Checkout[UPI / Card / NetBanking]
    Checkout -->|Payment Success Callback| EdgeVerify[Edge Function: verify-payment]
    EdgeVerify -->|Cryptographic HMAC-SHA256 Check| PG[(Supabase PostgreSQL)]
    EdgeVerify -->|Uploads Voice File| S3[(Supabase Private Storage)]
    PG -->|Trigger: Auto-generates 7-Day Journey| Days[wish_days Table]
    EdgeVerify -->|Returns Unique Reference ID & PIN| Success[Success Screen]
    Success -->|Day 1 Unlocked| Journey[7-Day Positive Reflection Journey]
    Admin([Custodian]) -->|Authenticates via Supabase Auth| AdminDash[/admin Dashboard]
    AdminDash -->|Signed Audio URL & Moderation| PG
```

---

## 📂 Project Structure

```
wishmaker/
├── index.html                      # HTML5 entry with Google Fonts & Razorpay SDK
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # Strict TypeScript compiler options
├── vite.config.ts                  # Vite build config with manual chunk splitting
├── tailwind.config.js              # Sacred color palette & animations
├── vercel.json                     # Vercel SPA rewrites & security headers
├── .env.example                    # Environment variables template
├── supabase/
│   ├── migrations/
│   │   └── 20261124000000_make_a_wish_schema.sql  # Complete PostgreSQL schema & RLS
│   └── functions/
│       ├── create-razorpay-order/  # Server-side order creation
│       ├── verify-payment/         # HMAC verification & atomic wish registration
│       ├── razorpay-webhook/       # Webhook listener for payment capture
│       └── get-signed-audio-url/   # Time-limited signed URL generator for audio
└── src/
    ├── types/                      # Central TypeScript interfaces
    ├── i18n/                       # i18next configuration & 6 locale dictionaries
    │   ├── locales/                # en.json, ta.json, hi.json, te.json, ml.json, kn.json
    │   └── i18n.ts
    ├── lib/                        # Supabase client, Razorpay loader, Web Audio soundtrack
    ├── components/                 # DiyaFlame, DiyaParticles, VoiceRecorder, Navbar, Footer
    └── pages/                      # Home, MakeWish, Success, Journey, Community,
                                    # About, Privacy, Terms, Contact, AdminLogin, AdminDashboard
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
git clone <repository-url>
cd wishmaker
npm install
```

### 3. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your project keys:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
VITE_APP_URL=http://localhost:5173
```

> **Note on Instant Demo Mode**: The application is built with a resilient client-side storage fallback (`localDb`) and sandbox test gateway. If you run the app without real Supabase or Razorpay credentials, the entire application—including wish submission, 3-minute voice recording, simulated payment verification, 7-day reflection journey, virtual Diya lighting, and admin portal—works immediately out of the box!

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Backend Setup

### 1. Execute SQL Migration
In your Supabase project, navigate to the **SQL Editor** and run the contents of:
`supabase/migrations/20261124000000_make_a_wish_schema.sql`

This script automatically sets up:
- `profiles`, `admin_roles`, `payments`, `wishes`, `voice_notes`, `wish_days`, and `community_blessings` tables.
- Foreign keys, unique constraints, and performance indexes.
- Row Level Security (RLS) policies guaranteeing public anonymity and admin isolation.
- Automatic trigger `trigger_initialize_wish_journey` that seeds the 7 daily reflection steps upon wish insertion.
- Stored procedures: `is_admin()`, `get_wish_journey()`, and `light_diya()`.
- Private Storage bucket `wish-voice-notes` with 15MB file size limits and allowed audio MIME types.

### 2. Configure Edge Functions
Deploy the functions to Supabase:
```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment
supabase functions deploy razorpay-webhook
supabase functions deploy get-signed-audio-url
```

Set server-side secrets in Supabase (Dashboard -> Settings -> Secrets or via CLI):
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
supabase secrets set RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyy
supabase secrets set RAZORPAY_WEBHOOK_SECRET=zzzzzzzzzzzzzz
```

---

## 💳 Razorpay Test Mode Setup

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle the switch in the header to **Test Mode**.
3. Go to **Settings > API Keys** and click **Generate Test Key**.
4. Set `VITE_RAZORPAY_KEY_ID` in `.env` to your test key (`rzp_test_...`).
5. Set `RAZORPAY_KEY_SECRET` in your server environment / Supabase secrets.
6. Under **Settings > Webhooks**, add a webhook pointing to:
   `https://<your-project-id>.supabase.co/functions/v1/razorpay-webhook`
   Select events: `payment.captured`, `order.paid`, `payment.failed`.

---

## 🛡️ Admin Access

1. Navigate to `/admin/login`.
2. Default credentials for local testing:
   - **Email**: `admin@makeawish.org`
   - **Password**: `SacredAdmin2026!`
3. To grant admin access to a live Supabase Auth user, insert a record into the `admin_roles` table:
   ```sql
   INSERT INTO public.admin_roles (user_id, role)
   VALUES ('<supabase-auth-user-uuid>', 'admin');
   ```

---

## 🚢 Vercel Deployment

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select your repository.
3. Configure the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
   - `VITE_APP_URL`
5. Click **Deploy**. Single Page App (SPA) routing is handled automatically by `vercel.json`.

---

## 🕊️ Ethical Transparency Notice

**MAKE A WISH** is dedicated to mental well-being, mindfulness, and clarity.
- The ₹10 payment is a service contribution covering digital audio storage, payment gateway processing, and content delivery.
- We do **not** claim supernatural, magical, or astrological powers, nor do we promise that wishes will definitely come true.
- All user data and voice notes are stored with strict encryption and may be deleted permanently upon request via `privacy@makeawish.org`.
