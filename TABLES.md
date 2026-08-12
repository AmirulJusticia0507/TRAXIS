
---

## 5. `TABLES.md`

> **Data Grids, Pagination, Search & Sorting**

```markdown
# 📊 Data Tables & Grid Specifications

## 1. Standard Table Spec: "Jadwal Real-time Kereta"

### Column Architecture
| Column Header | Data Key (SQL Match) | Sortable | Filterable | Alignment |
| :--- | :--- | :--- | :--- | :--- |
| Kode Kereta | `train_code` | Ya | Ya (Text Search) | Left |
| Jalur / Line | `line_name` | Ya | Ya (Dropdown) | Left |
| Stasiun Asal | `origin_station` | Ya | Ya | Left |
| Stasiun Tujuan | `destination_station`| Ya | Ya | Left |
| Jam Keberangkatan | `departure_time` | Ya | No | Center |
| Status Operasional | `status` | Ya | Ya (Multi-select) | Center |
| Aksi | - | No | No | Center |

## 2. Data Flow & Pagination Strategy
* **Server-side Pagination & Sorting:** Semua operasi filter, sort, dan pagination dikirimkan langsung ke REST API sebagai query parameters.
  * Query Example: `GET /api/v1/schedules?page=1&limit=20&sort=departure_time&order=asc&line=KRL_RED`
* **Performance:** Penggunaan Angular `trackBy` / syntax `@for` baru dengan unique key ID untuk efisiensi render DOM pada data jadwal berkuantitas tinggi.

## 3. UI/UX Rules
* State **Loading**: Tampilkan *skeleton loader* saat fetch data API.
* State **Empty**: Tampilkan ilustrasi dan pesan mumpuni saat query search/filter tidak menghasilkan data.
* State **Error**: Sediakan tombol *"Coba Lagi"* jika panggilan API gagal.
```
