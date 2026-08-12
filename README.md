Overview & Getting Started


# 🚆 MRT & KRL Transit Management System (TMS)

Sistem Informasi Manajemen dan Monitoring Operasional Real-time untuk jaringan transportasi publik MRT dan KRL.

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** Angular (v17+) with Standalone Components & Signals
- **Language:** TypeScript & JavaScript (ESNext)
- **Styling:** SCSS / CSS3 (BEM Convention)
- **State & Data Flow:** RxJS, Signals, REST APIs
- **Database:** PostgreSQL / MySQL (Relational SQL Schema)
- **Tooling:** Angular CLI, ESLint, Jasmine/Karma (Testing)

## 📁 Repository Structure



├── src/
│   ├── app/
│   │   ├── core/           # Singleton services, interceptors, guards
│   │   ├── shared/         # Reusable UI components (tables, forms)
│   │   └── features/       # Feature modules (schedules, trains, ticketing)
│   │       ├── trains/
│   │       ├── schedules/
│   │       └── incidents/
│   ├── assets/             # Static files, icons, i18n
│   └── styles/             # Global styles, variables, mixins
├── docs/                   # System Documentation
│   ├── guidelines.md
│   ├── styles.md
│   ├── forms.md
│   ├── tables.md
│   └── goals.md
└── README.md

## 🚀 Setup & Installation

```bash
# Clone repository
git clone [https://github.com/organization/mrt-krl-tms.git](https://github.com/organization/mrt-krl-tms.git)

# Install dependencies
npm install

# Run development server
ng serve --open
🐞 Debugging & Logging Strategy
HttpInterceptor: Memotong semua REST API request/response untuk logging kesalahan network/server.

Global ErrorHandler: Menangkap error runtime Angular yang tidak terduga dan meneruskannya ke dashboard monitor.

Source Maps: Diaktifkan pada environment Staging/Dev untuk kemudahan inspeksi via DevTools.

🤝 Cross-Team Collaboration Workflow
Backend Team: Integrasi API berpatokan pada kontrak OpenAPI/Swagger. Selalu sinkronkan data type mapping (TypeScript Interfaces vs SQL Types).

QA Team: Setiap fitur wajib menyertakan unit test komponen dasar dan mendukung e2e test IDs (data-testid).
```
