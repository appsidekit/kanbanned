# Feature: Tagged Drop Zones

## Overview

When dragging a card into a tag section within a column, automatically assign that tag to the card.

```
┌─────────────────┐
│   To Do         │
├─────────────────┤
│ (no tag area)   │  ← drop here: removes tag
│   • card 1      │
├─────────────────┤
│ ● Frontend      │  ← drop here: assigns Frontend tag
│   • card 2      │
│   • card 3      │
├─────────────────┤
│ ● Backend       │  ← drop here: assigns Backend tag
│   • card 4      │
└─────────────────┘
```

## Current State

- `SortableColumn.tsx` already groups cards by tags visually (untagged first, then tag groups)
- Each tag group has a header with colored dot + name + count
- Drop targets exist at column level (`column-{id}`) but not at tag-zone level
- Cards keep their existing tag when moved between columns

## Implementation

### 1. Add Tag Zone Droppables

**File: `components/board/SortableColumn.tsx`**

Create droppable zones for each tag section:

```tsx
// For untagged zone
const { setNodeRef: setUntaggedRef } = useDroppable({
  id: `zone-${column.id}-untagged`,
  data: { columnId: column.id, tagId: null }
});

// For each tag zone
const { setNodeRef: setTagRef } = useDroppable({
  id: `zone-${column.id}-${tag.id}`,
  data: { columnId: column.id, tagId: tag.id }
});
```

### 2. Update Drag End Handler

**File: `app/page.tsx`**

Modify `handleDragEnd` to detect zone drops and update card tags:

```tsx
// In handleDragEnd, after determining targetColumnId:

let newTagId: string | undefined | null = undefined; // undefined = no change

if (overId.startsWith("zone-")) {
  const parts = overId.split("-");
  // zone-{columnId}-{tagId|untagged}
  targetColumnId = parts[1];
  newTagId = parts[2] === "untagged" ? null : parts[2];
}

// When inserting the card:
const movedCard = newTagId !== undefined
  ? { ...activeCard, tagId: newTagId ?? undefined }
  : activeCard;
```

### 3. Visual Feedback for Zones

**File: `components/board/SortableColumn.tsx`**

Add hover states to indicate active drop zones:

```tsx
const { isOver, setNodeRef } = useDroppable({ ... });

<div
  ref={setNodeRef}
  className={cn(
    "rounded-md transition-colors",
    isOver && "bg-white/5 ring-1 ring-white/20"
  )}
>
```

### 4. Tag Zone Visibility

Keep current behavior: tag zones only appear when cards with that tag exist in the column. The "untagged" zone is always visible (it's where cards without tags live).

## Files to Modify

| File | Changes |
|------|---------|
| `components/board/SortableColumn.tsx` | Add droppable zones per tag group |
| `app/page.tsx` | Update `handleDragEnd` to handle zone IDs and update card tags |

## Edge Cases

1. **Card dropped on another card in a tag zone** - Should inherit zone's tag
2. **Card dropped on column header** - Goes to untagged section
3. **Empty tag zones** - Need visual indication they're droppable
4. **Creating new tags** - New zones appear automatically

## Verification

1. Drag a card into a tag zone → card gets that tag
2. Drag a tagged card to untagged zone → tag is removed
3. Drag a card to a different column's tag zone → moves column AND updates tag
4. Visual feedback appears when hovering over zones
5. Works on mobile (touch drag)

## Decisions

- **Empty zones:** Only show tags in use (current behavior)
- **Untagged zone:** Always visible at top of column
