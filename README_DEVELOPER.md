# Everkind Consumers — Developer Guide

Welcome! This guide will help you understand the project structure, tech stack, and how everything is configured.

---

## 🏗️ Project Overview

**Everkind Consumers** is a modern marketing website for Everkind, showcasing brand portfolios and capturing leads through application forms. The site is built with **Astro** and hosted on **Vercel**.

### Key Features
- Static site generation with server-side rendering for dynamic forms
- Notion CMS integration for blogs, careers, and investment opportunities
- Responsive design with Tailwind CSS
- Smooth animations with GSAP and Lenis
- Form submissions stored directly in Notion databases

---

## 🛠️ Tech Stack

### Frontend
- **[Astro](https://astro.build/)** (v6.0.8) — Static site generator with server-side rendering
- **[Tailwind CSS](https://tailwindcss.com/)** (v4.2.2) — Utility-first CSS framework
- **[GSAP](https://greensock.com/gsap/)** (v3.14.2) — Professional-grade animation library
- **[Lenis](https://lenis.studiofreight.com/)** (v1.3.21) — Smooth scrolling library

### Backend
- **[Notion API](https://developers.notion.com/)** — Headless CMS for content and form submissions
- **[Node.js Adapter](https://docs.astro.build/en/guides/integrations-guide/node/)** — Server-side execution
- **[Vercel Adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)** — Serverless deployment

### DevOps & Hosting
- **[Vercel](https://vercel.com/)** — Backend & serverless functions
- **[GoDaddy cPanel](https://www.godaddy.com/)** — Corporate email only (not backend hosting)
- **[Git/GitHub](https://github.com/)** — Version control

### Required Node Version
- **Node.js ≥ 22.12.0**

---

## 📁 Project Structure

```
everkind-consumers/
├── src/
│   ├── assets/               # Images and illustrations
│   ├── components/           # Reusable Astro components
│   │   ├── BlogCard.astro
│   │   ├── BrandCards.astro         # Dynamic brand display
│   │   ├── ContactForm.astro
│   │   ├── CTA.astro                # Call-to-action
│   │   ├── Footer.astro
│   │   ├── Hero.astro               # Landing hero section
│   │   ├── InvestorCard.astro
│   │   ├── Investors.astro
│   │   ├── Navbar.astro
│   │   ├── NotionBlock.astro        # Renders Notion content
│   │   ├── OpportunityForm.astro    # Form for opportunities
│   │   ├── OurBrands.astro          # Brand showcase (editable)
│   │   ├── TextMain.astro
│   │   ├── TextWithIllustration.astro
│   │   ├── WhyChooseUs.astro        # Alternate version (commented out)
│   │   ├── WhyChooseUsClient.astro  # Interactive version (active)
│   │   └── Navbar.astro
│   ├── layouts/
│   │   └── Layout.astro             # Main page wrapper
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   ├── about.astro
│   │   ├── blog.astro
│   │   ├── careers.astro
│   │   ├── contact.astro
│   │   ├── investors.astro
│   │   ├── opportunities.astro
│   │   ├── api/
│   │   │   └── submit-application.js # Backend API endpoint
│   │   ├── blog/
│   │   │   └── [slug].astro         # Dynamic blog pages
│   │   └── careers/
│   │       └── [slug].astro         # Dynamic career pages
│   └── styles/
│       └── global.css               # Global styles
├── scripts/                         # Notion sync & audit scripts
│   ├── seed-notion-test-data.mjs
│   ├── check-notion-datasource.mjs
│   ├── check-notion-write-access.mjs
│   ├── audit-notion-config.mjs
│   └── print-notion-schema.mjs
├── public/                          # Static assets
│   ├── Comp_1_Sim_01.json
│   └── Comp_2_Sim_01.json
├── .env                             # Environment variables (Notion API keys)
├── astro.config.mjs                 # Astro configuration
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies & scripts
```

---

## 💡 Commented Out Sections

There are intentionally commented-out sections in the codebase for future features:

### 1. **Homepage — Alternative Why Choose Us Component**
**File:** `src/pages/index.astro` (line 17)

```astro
<!-- <WhyChooseUs /> -->  <!-- Replaced with WhyChooseUsClient for interactivity -->
```

**Why?** The project uses `WhyChooseUsClient.astro` (interactive with hotspot dots) instead of the static `WhyChooseUs.astro`. Keep the static version as a fallback if needed.

---

### 2. **Our Brands — Ready for Expansion**
**File:** `src/components/OurBrands.astro` (lines 4–14)

```javascript
// import ill2 from '../assets/Illustration2.svg';
// import ill3 from '../assets/Illustration3.svg';

// { name: 'Brand Two',   href: '#', img: ill2 },
// { name: 'Brand Three', href: '#', img: ill3 },
```

**How to activate:** 
1. Import additional brand illustrations
2. Uncomment the brand objects in the `brands` array
3. Add their images to `src/assets/`
4. Themes are auto-assigned — just provide `name`, `href`, and `img`

---

### 3. **Our Brands — Coming Soon Card**
**File:** `src/components/OurBrands.astro` (lines 65–100)

A "Coming Soon" card is commented out. Uncomment to show a placeholder for future brands.

---

### 4. **Brand Cards — New Tab Links**
**File:** `src/components/BrandCards.astro`

Links now open in new tabs with `target="_blank"` and `rel="noopener noreferrer"`.

---

## 🔧 Backend Configuration

### Notion Integration

The backend uses **Notion as a Headless CMS** for:
- Job applications & careers
- Blog posts & articles
- Investment opportunities
- Investor directory

#### Environment Variables

All secrets are stored in `.env` (never commit this file):

```env
# Application Form Keys
NOTION_SECRET=ntn_...
NOTION_DATABASE_ID=...
NOTION_DATA_SOURCE_ID=...

# Blog/Journal Keys
NOTION_BLOG_SECRET=ntn_...
NOTION_BLOG_DB_ID=...
NOTION_BLOG_DATA_SOURCE_ID=...

# Career Pages Keys
NOTION_CAREERS_DB_SECRET=ntn_...
NOTION_CAREERS_DB_ID=...
NOTION_CAREERS_DATA_SOURCE_ID=...

# Investors Directory Keys
NOTION_INVESTORS_SECRET=ntn_...
NOTION_INVESTORS_DATABASE_ID=...
NOTION_INVESTORS_DATA_SOURCE_ID=...
```

#### API Endpoint: Submit Application

**File:** `src/pages/api/submit-application.js`

This endpoint receives form submissions and writes them to a Notion database.

**How it works:**
1. Form data is sent as JSON POST request
2. Notion API client creates a new page in the applications database
3. Properties are mapped to Notion columns (Name, Email, Role, Resume, LinkedIn, etc.)
4. Errors are logged to the terminal with debugging info

**Example Request:**
```javascript
const response = await fetch('/api/submit-application', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Brand Manager',
    experience: '3-5 years',
    linkedin: 'https://linkedin.com/in/johndoe',
    resume: 'https://example.com/john-resume.pdf',
    resumeFilename: 'John_Resume.pdf'
  })
});
```

#### Resume Upload Handling via Google Apps Script

Resume uploads are processed through a **custom Google Apps Script** that automates the entire workflow:

**Flow:**
1. User uploads resume file via the application form
2. Google Apps Script receives the file
3. Script uploads file to **Google Drive** (automatically organized)
4. Script generates a shareable Google Drive link
5. Link is sent to Notion as an external file reference
6. Application record in Notion includes the Drive link

**Why this approach?**
- ✅ Automatic file organization in Google Drive
- ✅ No server storage on Vercel (avoids file size limits)
- ✅ Shareable links for easy access by hiring team
- ✅ Secure storage with Google's infrastructure
- ✅ Seamless Notion integration

**API Endpoint receives:**
```javascript
// Form submission to /api/submit-application
{
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Brand Manager',
  experience: '3-5 years',
  linkedin: 'https://linkedin.com/in/johndoe',
  resume: 'https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing',  // Generated by Apps Script
  resumeFilename: 'John_Doe_Resume.pdf'
}
```

**Notion Storage:**
- `Upload CV` field → External file link (from Google Drive)
- `resumeFilename` → Display name in the file block
- The hiring team can access all resumes directly from Google Drive or Notion

**Google Apps Script Configuration:**
The script handles:
- File upload reception
- Validation (file size, type)
- Google Drive folder organization (by date/role)
- Link generation
- Error handling and logging

#### Built-in Notion Block Parser

**File:** `src/components/NotionBlock.astro`

This component recursively renders any Notion block structure into beautifully styled HTML. It's the engine that powers dynamic content (blogs, career pages, opportunities).

**Supported Block Types:**

| Block Type | Rendering | Notes |
|-----------|-----------|-------|
| `paragraph` | `<p>` with rich text formatting | Supports nested children |
| `heading_1` | `<h2>` with green left border | Serif font, large size |
| `heading_2` | `<h3>` | Standard heading |
| `heading_3` | `<h4>` | Smaller heading |
| `bulleted_list_item` | `<ul>` with disc/circle/square | Depth-based styling |
| `numbered_list_item` | `<ol>` with decimal numbering | Depth-based styling |
| `image` | `<img>` with Everkind styling | Supports external & file URLs |
| `divider` | `<div>` with green separator | Visual section divider |

**Rich Text Formatting:**

All text supports these annotations:
- **Bold** → `<strong>` with dark color
- *Italic* → `<em>` italicized
- <u>Underline</u> → `<u>` with green underline
- `Code` → `<code>` with green background
- [Links](https://example.com) → `<a>` with green text + `target="_blank"`

**Example: How it works**
```astro
<!-- In a page like blog/[slug].astro -->
{pageBlocks.map((block) => (
  <NotionBlock block={block} depth={0} />
))}
```

The component recursively renders all nested children with proper indentation and styling.

#### Notion Utility Scripts

Run these from the terminal to audit and manage your Notion databases:

```bash
npm run astro -- audit-notion-config.mjs       # Verify all configs
npm run astro -- check-notion-datasource.mjs   # Check datasource connectivity
npm run astro -- check-notion-write-access.mjs # Verify write permissions
npm run astro -- print-notion-schema.mjs       # Print database schema
npm run astro -- seed-notion-test-data.mjs     # Populate test data
```

#### Notion Data Pipelines

**What are data pipelines?**

Notion Data Pipelines automate the flow of information between Notion databases, external services, and your website. They enable real-time synchronization and automated workflows.

**Current Implementation:**

The Everkind site uses Notion's Data Sources and API to create pipelines that:

1. **Ingest External Data** — Resume uploads from Google Apps Script → Notion
2. **Sync Content** — Blog posts, careers, investor info automatically populate pages
3. **Trigger Actions** — Form submissions → Notion records → Team notifications
4. **Export Data** — Notion data → Frontend pages (dynamic rendering)

**Data Pipeline Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interactions                         │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─ Job Application Form
         │      ↓
         │  Google Apps Script (Resume Upload)
         │      ↓
         │  Google Drive (File Storage)
         │      ↓
         ├─ Notion API (/api/submit-application.js)
         │      ↓
         │  Notion Database (Job Applications)
         │      ↓
         ├─ Notion Query (Astro build time)
         │      ↓
         ├─ Display on /careers page
         │
         ├─ Contact Form (EmailJS)
         │      ↓
         │  EmailJS Service
         │      ↓
         ├─ Email sent to team inbox
         │      ↓
         └─ Team reviews & responds
```

**Key Components:**

- **Data Source ID** — Identifies the Notion database connection
- **API Secret** — Authenticates API requests
- **Database Properties** — Schema that defines data structure
- **Sync Direction** — Read (fetch from Notion) vs Write (send to Notion)

**Environment Variables for Data Pipelines:**

```env
# Each database needs 3 variables for its pipeline
NOTION_[NAME]_SECRET=ntn_...              # API authentication
NOTION_[NAME]_DATABASE_ID=...             # Database identifier
NOTION_[NAME]_DATA_SOURCE_ID=...          # Data source connection
```

**Best Practices:**

- ✅ Run `check-notion-datasource.mjs` after schema changes
- ✅ Keep Data Source IDs in `.env` (never hardcode)
- ✅ Test pipelines locally before pushing to production
- ✅ Monitor Notion API rate limits (Vercel has quotas)
- ✅ Use separate databases for different data types (don't mix applications + blog posts)

---

### EmailJS Integration for Contact Forms

**What is EmailJS?**

EmailJS is a service that enables sending emails directly from the frontend without a backend server. The site uses it to handle contact form submissions from the `/contact` page.

**Current Configuration:**

The `ContactForm.astro` component uses these EmailJS credentials:

```javascript
const EMAILJS_PUBLIC_KEY  = '5DVr18ZSIlnxfjy47';
const EMAILJS_SERVICE_ID  = 'service_8tg61xn';
const EMAILJS_TEMPLATE_ID = 'template_qvoqz4w';
```

**How it works:**

1. **User submits form** — Name, email, message
2. **Form validates** — Required fields, email format
3. **EmailJS receives request** — Frontend sends data to EmailJS
4. **Template is applied** — EmailJS formats the message
5. **Email is sent** — To Everkind team inbox
6. **Response shown** — Success/error message displayed to user

**Contact Form Component:**

**File:** `src/components/ContactForm.astro`

The form includes:
- Real-time validation
- Success/error feedback
- Smooth interactions
- CORS-safe email delivery

**Email Template Structure:**

EmailJS templates use variables from the form:
```
From: {{email}}
Name: {{name}}
Message: {{message}}
```

The template is configured in the EmailJS dashboard to format and route these fields.

**Environment Variables:**

While these credentials are currently hardcoded in the component, best practice would be to move them to `.env`:

```env
EMAILJS_PUBLIC_KEY=5DVr18ZSIlnxfjy47
EMAILJS_SERVICE_ID=service_8tg61xn
EMAILJS_TEMPLATE_ID=template_qvoqz4w
```

Then update the component:
```javascript
const EMAILJS_PUBLIC_KEY  = import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID  = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID;
```

**Troubleshooting EmailJS Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid service" | Wrong Service ID | Verify ID in EmailJS dashboard |
| Email not received | Template misconfigured | Check EmailJS template variables |
| CORS error | Public key issue | Ensure Whitelist includes your domain in EmailJS settings |
| Rate limit error | Too many submissions | EmailJS free tier has limits; consider plan upgrade |

**EmailJS Dashboard:**

To manage templates, services, and settings:
1. Log in to [EmailJS](https://www.emailjs.com/)
2. Go to Email Templates → Find `template_qvoqz4w`
3. Modify template formatting as needed
4. Test with preview before deploying

**Advantages of EmailJS:**

- ✅ No backend required for contact forms
- ✅ Works on Vercel's serverless architecture
- ✅ Secure (public key only, no secrets exposed)
- ✅ Easy template management
- ✅ Spam protection & rate limiting included
- ✅ Analytics on email delivery

**Limitations:**

- Limited to free tier monthly sending quota
- No persistent storage of contact submissions (consider adding to Notion for long-term records)
- Email formatting limited to template system

---

## 🚀 Deployment Architecture

### Backend on Vercel

**Why Vercel?**
- Serverless functions for API routes (like form submissions)
- Automatic deployments from Git
- Built-in environment variable management
- Optimized for Astro SSR

**How it works:**
1. Push code to GitHub
2. Vercel automatically builds & deploys
3. API routes (`src/pages/api/*`) become serverless functions
4. Form submissions are processed and stored in Notion

**Vercel Configuration:**
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',        // Enable SSR
  adapter: vercel()        // Deploy to Vercel
});
```

### Domain, Email & DNS with GoDaddy cPanel

**Important:** GoDaddy is **NOT used for backend hosting**. It's only used for:

✅ **Domain Management**
- DNS records point to Vercel's nameservers
- Custom domain setup for everkind.com

✅ **Corporate Email**
- Email accounts for team members
- cPanel interface for mailbox management
- IMAP/POP3 access for email clients

❌ **NOT Used For:**
- Hosting the website (that's Vercel)
- Backend infrastructure (that's Vercel serverless)
- Database hosting (that's Notion)

**DNS Setup:**
1. Domain purchased through GoDaddy
2. Nameservers point to Vercel
3. Email MX records configured in cPanel
4. SSL/TLS managed by Vercel (free)

---

## 📝 Adding New Brands

To add a new brand to the showcase:

1. **Add the brand illustration:**
   ```bash
   # Place your image in src/assets/
   # e.g., Illustration2.svg, Illustration3.svg
   ```

2. **Uncomment and update `OurBrands.astro`:**
   ```javascript
   import ill2 from '../assets/Illustration2.svg';
   
   const brands = [
     { name: 'Herbal Wisdom™', href: 'https://theherbalwisdom.com/', img: ill1 },
     { name: 'New Brand Name', href: 'https://new-brand-url.com/', img: ill2 },
   ];
   ```

3. **Themes are automatic:**
   - Each brand gets a unique color theme from the THEMES array in `BrandCards.astro`
   - Themes cycle: `Theme 1 → Theme 2 → Theme 3 → Theme 4 → (repeat)`

---

## 🎨 Styling & Design

### Global Colors
```css
/* src/styles/global.css */
:root {
  --color-everkind-dark: #1a1a1a;
  --color-everkind-green: #2d6a4f;
  --color-everkind-lightgrey: #f5f5f5;
  --color-everkind-darkgrey: #3a3a3a;
  --color-everkind-bg: #ffffff;
  --font-serif: 'Georgia', serif;
  --font-sans: 'System Font Stack', sans-serif;
}
```

### Responsive Breakpoints (Tailwind)
- `sm:` — Small (640px)
- `md:` — Medium (768px)
- `lg:` — Large (1024px)

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file with all Notion API keys (ask your manager for these).

### 3. Run Development Server
```bash
npm run dev
```

Opens at `http://localhost:specificport number`

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server with HMR

# Building
npm run build            # Build for production
npm run preview          # Preview production build locally

# Astro CLI
npm run astro -- --help # Full Astro CLI reference

# Notion Scripts
npm run astro -- seed-notion-test-data.mjs     # Test Notion connectivity
npm run astro -- check-notion-write-access.mjs # Verify write permissions
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@notionhq/client'"
**Solution:** Run `npm install`

### Issue: Form submissions fail silently
**Solution:** Check the terminal for "🚨 NOTION SUBMIT REJECTED" debug output. Verify:
- Database IDs are correct
- Property names match exactly (case-sensitive)
- API key has write permissions

### Issue: Notion API Key errors
**Solution:** Verify the `.env` file contains valid Notion integration tokens. Test with:
```bash
npm run astro -- check-notion-datasource.mjs
```

### Issue: Build fails with "adapter not found"
**Solution:** Ensure `@astrojs/vercel` is installed: `npm install @astrojs/vercel`

---

## 🔐 Security Best Practices

- ✅ Keep `.env` files **out of Git** (add to `.gitignore`)
- ✅ Never commit API keys or secrets
- ✅ Use `target="_blank"` + `rel="noopener noreferrer"` for external links
- ✅ Validate all form inputs on the backend (Notion will reject invalid data)
- ✅ Use HTTPS only (Vercel handles this automatically)

---

## 📖 Documentation Links

- **Astro Docs:** https://docs.astro.build/
- **Notion API:** https://developers.notion.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GSAP:** https://greensock.com/docs/
- **Lenis:** https://github.com/studio-freight/lenis

---

