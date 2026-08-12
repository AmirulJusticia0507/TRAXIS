
---

## 4. `FORMS.md`

> **Form Specifications, Validation & Dynamic Inputs**

```markdown
# 📝 Form Specifications & Validation Rules

## 1. Technology Standard
Semua form menggunakan **Angular Reactive Forms** (`FormBuilder`, `FormGroup`, `FormControl`) untuk penanganan input yang aman dan terprediksi.

## 2. Standard Form Spec: "Pencatatan Insiden Jalur"

### Fields & Validation
| Field Name | HTML Input Type | Validation Rules | Error Message |
| :--- | :--- | :--- | :--- |
| `lineType` | `select` | Required | Line (MRT/KRL) harus dipilih. |
| `trainId` | `select` | Required | Armada Kereta wajib dipilih. |
| `locationStation` | `text` | Required, Min length 3 | Lokasi stasiun minimal 3 karakter. |
| `delayDuration` | `number` | Min: 0, Max: 300 | Durasi keterlambatan 0-300 menit. |
| `description` | `textarea` | Required, Max 500 chars | Deskripsi wajib diisi max 500 karakter. |

### Component Implementation Example
```typescript
this.incidentForm = this.fb.group({
  lineType: ['', Validators.required],
  trainId: ['', Validators.required],
  locationStation: ['', [Validators.required, Validators.minLength(3)]],
  delayDuration: [0, [Validators.min(0), Validators.max(300)]],
  description: ['', [Validators.required, Validators.maxLength(500)]]
});
UX & Accessibility Standard
Error message ditampilkan secara inline di bawah input tepat setelah status touched atau form di-submit.

Tombol submit otomatis di-disable jika form dalam keadaan invalid atau sedang memproses request HTTP (pending).
```
