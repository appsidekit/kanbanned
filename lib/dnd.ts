// DnD Types
export type DropData = {
  type: "zone" | "card";
  columnId: string;
  zoneTagId: string | null;
};

// Zone ID utilities
export const createZoneId = (columnId: string, tagId: string | null) =>
  tagId ? `zone-${columnId}-${tagId}` : `zone-${columnId}-untagged`;

export const createColumnDropId = (columnId: string) => `column-${columnId}`;

export const DELETE_ZONE_ID = "delete-zone";

// Sensor options (for use with useSensor hook)
export const POINTER_SENSOR_OPTIONS = {
  activationConstraint: { distance: 8 },
};

export const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 200, tolerance: 5 },
};
