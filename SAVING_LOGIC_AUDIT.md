# Saving Logic Audit Report

Based on review of `storage.ts`, `types.ts`, and `page.tsx`.

---

## Critical Issues

### 1. Version Field Unused
**Location:** `storage.ts:86`, `types.ts:23`
```typescript
version: 1  // Never checked during load
```
The version field exists but there's no migration logic. If the schema changes in the future, old data will break silently.

---

## High Priority Issues

### 2. Incomplete Validation
**Location:** `storage.ts:101-103`
```typescript
if (!parsed.boards || parsed.boards.length === 0) {
  return defaultAppData;
}
```
Only validates that `boards` array exists. Doesn't check:
- Individual board structure (id, name, columns)
- Column structure (id, name, cards)
- Card structure (id, title, description, priority)
- Priority values are valid ("low" | "medium" | "high")

### 3. Silent Data Replacement
**Location:** `storage.ts:101-103`

If boards array is empty, user data is silently replaced with defaults. User has no indication their data was reset.

### 4. No Save Debouncing
**Location:** `page.tsx:70,85,96,118,136,189,241,276`

Every action immediately calls `saveAppData()`. Rapid drag operations could trigger many serialization calls in succession, impacting performance.

---

## Medium Priority Issues

### 5. Potential ID Collisions
**Location:** `page.tsx:51,102,104`
```typescript
const timestamp = Date.now();
```
Using `Date.now()` for IDs could collide if two items are created in the same millisecond (unlikely but possible during rapid operations).

### 8. No Export/Import/Backup
Users cannot manually backup or restore their data. If localStorage is cleared (browser settings, storage pressure), all data is lost.

### 6. SSR Hydration Mismatch Risk
**Location:** `page.tsx:27,40-45`

Initial state uses `defaultAppData`, then `useEffect` loads real data. This could cause hydration mismatches or flicker in SSR scenarios.

---

## Low Priority Issues

### 7. Entire State Saved on Every Change
Even changing a single card title re-serializes and saves the entire app state. With many boards/cards, this becomes inefficient.

### 8. No Data Sanitization
User-provided strings (board names, card titles) are saved directly without sanitization. While localStorage is client-side only, this could matter if data is ever exported/shared.

### 9. Error Handling Swallows Details
**Location:** `storage.ts:105-107`
```typescript
} catch {
  return defaultAppData;
}
```
Parse errors return defaults silently. User loses data with no warning or diagnostic info.

---

## Summary Table

| Issue | Severity | Impact |
|-------|----------|--------|
| No runtime validation | Critical | App crash on corrupted data |
| No quota handling | Critical | Save failure, potential data loss |
| Unused version field | Critical | Future migrations impossible |
| Incomplete validation | High | Partial corruption undetected |
| Silent data reset | High | Data loss without user awareness |
| No debouncing | High | Performance degradation |
| ID collisions | Medium | Duplicate IDs possible |
| No backup mechanism | Medium | No recovery option |
| Error swallowing | Low | Poor diagnostics |

---

## Progress

- [x] 1. No runtime validation on load
- [x] 2. No localStorage quota handling
- [ ] 3. Version field unused
- [ ] 4. Incomplete validation
- [ ] 5. Silent data replacement
- [ ] 6. No save debouncing
- [ ] 7. Potential ID collisions
- [ ] 8. No export/import/backup
- [ ] 9. SSR hydration mismatch risk
- [ ] 10. Entire state saved on every change
- [ ] 11. No data sanitization
- [ ] 12. Error handling swallows details
