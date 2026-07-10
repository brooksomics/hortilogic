import { z } from 'zod'

export const PlantingStrategySchema = z.object({
  start_window_start: z.number(),
  start_window_end: z.number(),
})

export const CompanionRulesSchema = z.object({
  friends: z.array(z.string()),
  enemies: z.array(z.string()),
})

export const CropSchema = z.object({
  id: z.string().min(1),
  sfg_density: z.number().positive(),
  planting_strategy: PlantingStrategySchema,
  companions: CompanionRulesSchema,
  name: z.string().optional(),
  emoji: z.string().optional(),
  type: z.enum(['vegetable', 'herb', 'flower', 'fruit']),
  botanical_family: z.string().min(1),
  sun: z.enum(['full', 'partial', 'shade']),
  days_to_maturity: z.number().positive(),
  water_need: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  height_inches: z.number().positive(),
  trellisable: z.boolean(),
  edge_planting: z.boolean().optional(),
})
