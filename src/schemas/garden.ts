
import { z } from 'zod';

// ==========================================
// Profile Schemas
// ==========================================

export const ProfileSchema = z.object({
  name: z.string(),
  hardiness_zone: z.string(),
  last_frost_date: z.string(), // YYYY-MM-DD
  first_frost_date: z.string(), // YYYY-MM-DD
  season_extension_weeks: z.number().min(0).max(52),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileStorageSchema = z.object({
  version: z.literal(1),
  profiles: z.record(z.string(), ProfileSchema), // Key is UUID
  defaultProfileId: z.string().uuid(),
});

export type ValidatedProfileStorage = z.infer<typeof ProfileStorageSchema>;

// ==========================================
// Layout Schemas
// ==========================================

export const CellSchema = z.object({
  cropId: z.string(),
  plantedAt: z.number(),
}).nullable();

export type Cell = z.infer<typeof CellSchema>;

export const BoxSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  cells: z.array(CellSchema),
});

export type Box = z.infer<typeof BoxSchema>;

export const LayoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  profileId: z.string().uuid(),
  boxes: z.array(BoxSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Layout = z.infer<typeof LayoutSchema>;

export const LayoutStorageSchema = z.object({
  version: z.literal(2),
  layouts: z.record(z.string(), LayoutSchema), // Key is UUID
  activeLayoutId: z.string().uuid(),
});

export type ValidatedLayoutStorage = z.infer<typeof LayoutStorageSchema>;

// ==========================================
// Interaction Schemas
// ==========================================

// Stash is a record of CropID -> Quantity
export const StashStorageSchema = z.record(z.string(), z.number().int().nonnegative());

export type ValidatedGardenStash = z.infer<typeof StashStorageSchema>;
