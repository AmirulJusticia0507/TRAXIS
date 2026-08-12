
---

## 2. `GUIDELINES.md`

> **Development Guidelines, Angular Standards & Debugging Protocol**

```markdown
# 📑 Development & Collaboration Guidelines

## 1. TypeScript & Angular Best Practices
* **Strict Type Safety:** Dilarang menggunakan tipe `any`. Selalu definisikan `interface` atau `type` untuk payload API dan model internal.
* **Component Pattern:** Prioritaskan **Standalone Components**. Pakai Angular Signals untuk *local state* dan RxJS `Observable` untuk stream data REST API real-time.
* **Unsubscribe Strategy:** Gunakan `takeUntilDestroyed()` atau pipe `async` pada template HTML untuk mengantisipasi memory leak pada data telemetry kereta.

## 2. REST API & SQL Mapping
* **API Endpoints Pattern:**
  * `GET /api/v1/schedules` -> Fetch daftar jadwal
  * `POST /api/v1/trains` -> Tambah armada kereta
  * `PUT /api/v1/incidents/:id` -> Update status insiden jalur
* **Type Safety Bridge:**
  ```typescript
  // Synchronized with SQL Schema: trains (id INT, train_code VARCHAR, status ENUM)
  export interface Train {
    id: number;
    trainCode: string;
    status: 'ACTIVE' | 'MAINTENANCE' | 'DELAYED';
    capacity: number;
  }
3. Debugging Protocol
Network Debugging: Gunakan browser Network Tab untuk memeriksa payload JSON, HTTP status code (4xx, 5xx), serta latency endpoint jadwal real-time.

RxJS Debugging: Manfaatkan operator tap(console.log) atau extension RxJS DevTools untuk melacak stream peristiwa pergerakan kereta.

Console Hygiene: Hapus console.log sebelum membuat Pull Request. Gunakan service logger internal LoggerServiceService.

4. Collaboration Protocols
Backend Sync: Diskusi perubahan schema REST API / SQL wajib dicatat pada issue tracking sebelum PR dibuat.

QA Sync: Setiap komponen interaktif (tombol, input, tabel) WAJIB diberi attribute data-testid="nama-elemen" untuk automasi QA.
```
