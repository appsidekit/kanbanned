# Saving Logic Audit Report

Based on review of `storage.ts`, `types.ts`, and `page.tsx`.

---

## High Priority Issues

### No Board Deletion
Users can create new boards but cannot delete them. This could lead to localStorage bloat over time.

---

## Medium Priority Issues

### No Export/Import/Backup
Users cannot manually backup or restore their data. If localStorage is cleared (browser settings, storage pressure), all data is lost.

### SSR Hydration Mismatch Risk
**Location:** `page.tsx:31,59-71`

Initial state uses `defaultAppData`, then `useEffect` loads real data. This could cause hydration mismatches or flicker in SSR scenarios.

---

## Low Priority Issues

### Entire State Saved on Every Change
Even changing a single card title re-serializes and saves the entire app state. With many boards/cards, this becomes inefficient.

### No Data Sanitization
User-provided strings (board names, card titles) are saved directly without sanitization. While localStorage is client-side only, this could matter if data is ever exported/shared.
