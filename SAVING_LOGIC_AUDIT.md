# Saving Logic Audit Report

Based on review of `lib/storage.ts`, `lib/types.ts`, and `app/page.tsx`.

---

## High Priority

### No Board Deletion
Users can create new boards but cannot delete them. This could lead to localStorage bloat over time.

**Fix:** Add a delete button to the board dropdown in `Sidebar.tsx` and wire up `onBoardDelete` handler in `page.tsx`.

---

## Medium Priority

### No Export/Import/Backup
Users cannot manually backup or restore their data. If localStorage is cleared (browser settings, storage pressure), all data is lost.

**Fix:** Add export (download JSON) and import (upload JSON) functions to `storage.ts` and UI controls in the sidebar or settings.
