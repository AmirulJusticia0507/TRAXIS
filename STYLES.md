
---

## 3. `STYLES.md`

> **UI/UX & CSS Architecture Strategy**

```markdown
# 🎨 Style & Design System Guidelines

## 1. CSS Architecture & Naming
Sistem menggunakan **SCSS** dengan penamaan berstandar **BEM (Block Element Modifier)**.

```scss
/* Contoh BEM untuk Status Badge Kereta */
.train-card {
  &__header { ... }
  &__status {
    &--active { color: $color-success; }
    &--delayed { color: $color-warning; }
    &--out-of-service { color: $color-danger; }
  }
}
2. Design Tokens (SCSS Variables)
SCSS
// Brand Colors (Transit Palette)
$mrt-primary: #00529B;   // Classic Blue MRT
$krl-primary: #C8102E;   // Commuter Red KRL
$bg-main:     #F4F6F8;
$text-dark:   #1E293B;

// Status Colors
$status-active:    #10B981;
$status-warning:   #F59E0B;
$status-critical:  #EF4444;

// Spacing
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
3. Responsive Layout Rules
Layout utama menggunakan Flexbox dan CSS Grid.

Gunakan breakpoint standar:

Mobile: < 768px

Tablet: 768px - 1024px

Desktop (Dashboard Control Room): > 1024px
```
