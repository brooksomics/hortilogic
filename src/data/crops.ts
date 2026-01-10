/**
 * Core 50 Crop Database
 *
 * Companion planting data sourced from:
 * - "Carrots Love Tomatoes" by Louise Riotte
 * - University Extension Companion Planting Guides
 * - Mother Earth News Companion Planting Chart
 *
 * SFG Densities based on "Square Foot Gardening" by Mel Bartholomew
 * Planting windows based on frost tolerance and typical growing seasons
 */

import type { Crop } from '@/types/garden'

export const CORE_50_CROPS: Crop[] = [
  // ===== LEAFY GREENS (10) =====
  {
    id: 'lettuce',
    name: 'Lettuce',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['carrot', 'radish', 'cucumber'],
      enemies: [],
    },
  },
  {
    id: 'spinach',
    name: 'Spinach',
    sfg_density: 9,
    planting_strategy: { start_window_start: -6, start_window_end: 0 },
    companions: {
      friends: ['peas', 'radish'],
      enemies: [],
    },
  },
  {
    id: 'kale',
    name: 'Kale',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['onion', 'garlic', 'dill'],
      enemies: ['tomato'],
    },
  },
  {
    id: 'arugula',
    name: 'Arugula',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['cucumber', 'lettuce', 'spinach'],
      enemies: [],
    },
  },
  {
    id: 'swiss-chard',
    name: 'Swiss Chard',
    sfg_density: 4,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: {
      friends: ['onion', 'garlic', 'radish'],
      enemies: [],
    },
  },
  {
    id: 'bok-choy',
    name: 'Bok Choy',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 0 },
    companions: {
      friends: ['onion', 'dill', 'garlic'],
      enemies: ['tomato'],
    },
  },
  {
    id: 'collard-greens',
    name: 'Collard Greens',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['onion', 'garlic', 'dill'],
      enemies: ['tomato'],
    },
  },
  {
    id: 'mustard-greens',
    name: 'Mustard Greens',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['radish', 'peas', 'lettuce'],
      enemies: [],
    },
  },
  {
    id: 'endive',
    name: 'Endive',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['lettuce', 'radish'],
      enemies: [],
    },
  },
  {
    id: 'radicchio',
    name: 'Radicchio',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['lettuce', 'endive'],
      enemies: [],
    },
  },

  // ===== NIGHTSHADES (6) =====
  {
    id: 'tomato',
    name: 'Tomato',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: {
      friends: ['carrot', 'basil', 'parsley', 'onion'],
      enemies: ['potato', 'kale', 'bok-choy', 'collard-greens', 'peas'],
    },
  },
  {
    id: 'cherry-tomato',
    name: 'Cherry Tomato',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: {
      friends: ['carrot', 'basil', 'parsley', 'onion'],
      enemies: ['potato', 'kale', 'bok-choy', 'collard-greens', 'peas'],
    },
  },
  {
    id: 'pepper',
    name: 'Pepper',
    sfg_density: 1,
    planting_strategy: { start_window_start: 1, start_window_end: 6 },
    companions: {
      friends: ['basil', 'onion', 'carrot'],
      enemies: [],
    },
  },
  {
    id: 'eggplant',
    name: 'Eggplant',
    sfg_density: 1,
    planting_strategy: { start_window_start: 2, start_window_end: 6 },
    companions: {
      friends: ['basil', 'thyme', 'oregano'],
      enemies: [],
    },
  },
  {
    id: 'potato',
    name: 'Potato',
    sfg_density: 1,
    planting_strategy: { start_window_start: -2, start_window_end: 2 },
    companions: {
      friends: ['peas', 'cabbage', 'horseradish'],
      enemies: ['tomato', 'cherry-tomato', 'cucumber', 'pumpkin'],
    },
  },
  {
    id: 'tomatillo',
    name: 'Tomatillo',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 4 },
    companions: {
      friends: ['basil', 'carrot', 'onion'],
      enemies: ['potato'],
    },
  },

  // ===== BRASSICAS (8) =====
  {
    id: 'broccoli',
    name: 'Broccoli',
    sfg_density: 1,
    planting_strategy: { start_window_start: -4, start_window_end: 0 },
    companions: {
      friends: ['onion', 'dill', 'garlic'],
      enemies: [],
    },
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    sfg_density: 1,
    planting_strategy: { start_window_start: -4, start_window_end: 0 },
    companions: {
      friends: ['onion', 'dill', 'garlic'],
      enemies: [],
    },
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    sfg_density: 1,
    planting_strategy: { start_window_start: -4, start_window_end: 0 },
    companions: {
      friends: ['onion', 'dill', 'potato'],
      enemies: [],
    },
  },
  {
    id: 'brussels-sprouts',
    name: 'Brussels Sprouts',
    sfg_density: 1,
    planting_strategy: { start_window_start: -6, start_window_end: -2 },
    companions: {
      friends: ['onion', 'dill', 'garlic'],
      enemies: [],
    },
  },
  {
    id: 'kohlrabi',
    name: 'Kohlrabi',
    sfg_density: 4,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['onion', 'garlic'],
      enemies: [],
    },
  },
  {
    id: 'radish',
    name: 'Radish',
    sfg_density: 16,
    planting_strategy: { start_window_start: -4, start_window_end: 8 },
    companions: {
      friends: ['lettuce', 'peas', 'carrot', 'spinach'],
      enemies: [],
    },
  },
  {
    id: 'turnip',
    name: 'Turnip',
    sfg_density: 9,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['peas', 'radish'],
      enemies: ['potato'],
    },
  },
  {
    id: 'rutabaga',
    name: 'Rutabaga',
    sfg_density: 9,
    planting_strategy: { start_window_start: -6, start_window_end: 0 },
    companions: {
      friends: ['peas', 'onion'],
      enemies: [],
    },
  },

  // ===== LEGUMES (6) =====
  {
    id: 'peas',
    name: 'Sugar Snap Peas',
    sfg_density: 9,
    planting_strategy: { start_window_start: -8, start_window_end: -2 },
    companions: {
      friends: ['carrot', 'radish', 'turnip', 'cucumber'],
      enemies: ['tomato', 'cherry-tomato', 'onion', 'garlic'],
    },
  },
  {
    id: 'green-beans',
    name: 'Green Beans',
    sfg_density: 9,
    planting_strategy: { start_window_start: 0, start_window_end: 6 },
    companions: {
      friends: ['carrot', 'cucumber', 'radish'],
      enemies: ['onion', 'garlic'],
    },
  },
  {
    id: 'bush-beans',
    name: 'Bush Beans',
    sfg_density: 9,
    planting_strategy: { start_window_start: 0, start_window_end: 6 },
    companions: {
      friends: ['carrot', 'cucumber', 'radish'],
      enemies: ['onion', 'garlic'],
    },
  },
  {
    id: 'pole-beans',
    name: 'Pole Beans',
    sfg_density: 9,
    planting_strategy: { start_window_start: 0, start_window_end: 6 },
    companions: {
      friends: ['carrot', 'cucumber', 'radish'],
      enemies: ['onion', 'garlic'],
    },
  },
  {
    id: 'fava-beans',
    name: 'Fava Beans',
    sfg_density: 4,
    planting_strategy: { start_window_start: -8, start_window_end: -2 },
    companions: {
      friends: ['potato', 'carrot'],
      enemies: ['onion', 'garlic'],
    },
  },
  {
    id: 'edamame',
    name: 'Edamame',
    sfg_density: 9,
    planting_strategy: { start_window_start: 0, start_window_end: 6 },
    companions: {
      friends: ['carrot', 'cucumber'],
      enemies: ['onion', 'garlic'],
    },
  },

  // ===== ROOT VEGETABLES (8) =====
  {
    id: 'carrot',
    name: 'Carrot',
    sfg_density: 16,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: {
      friends: ['lettuce', 'tomato', 'peas', 'onion'],
      enemies: ['dill'],
    },
  },
  {
    id: 'beet',
    name: 'Beet',
    sfg_density: 9,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: {
      friends: ['onion', 'lettuce', 'cabbage'],
      enemies: [],
    },
  },
  {
    id: 'onion',
    name: 'Onion',
    sfg_density: 16,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['carrot', 'beet', 'tomato', 'lettuce'],
      enemies: ['peas', 'green-beans', 'bush-beans', 'pole-beans', 'fava-beans', 'edamame'],
    },
  },
  {
    id: 'garlic',
    name: 'Garlic',
    sfg_density: 16,
    planting_strategy: { start_window_start: -8, start_window_end: -2 },
    companions: {
      friends: ['tomato', 'lettuce', 'cabbage'],
      enemies: ['peas', 'green-beans', 'bush-beans', 'pole-beans', 'fava-beans', 'edamame'],
    },
  },
  {
    id: 'parsnip',
    name: 'Parsnip',
    sfg_density: 16,
    planting_strategy: { start_window_start: -4, start_window_end: 0 },
    companions: {
      friends: ['peas', 'radish'],
      enemies: [],
    },
  },
  {
    id: 'shallot',
    name: 'Shallot',
    sfg_density: 16,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['carrot', 'beet', 'tomato'],
      enemies: ['peas', 'green-beans', 'bush-beans', 'pole-beans'],
    },
  },
  {
    id: 'leek',
    name: 'Leek',
    sfg_density: 9,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['carrot'],
      enemies: ['peas', 'green-beans'],
    },
  },
  {
    id: 'horseradish',
    name: 'Horseradish',
    sfg_density: 1,
    planting_strategy: { start_window_start: -4, start_window_end: 2 },
    companions: {
      friends: ['potato'],
      enemies: [],
    },
  },

  // ===== CUCURBITS (6) =====
  {
    id: 'cucumber',
    name: 'Cucumber',
    sfg_density: 1,
    planting_strategy: { start_window_start: 1, start_window_end: 6 },
    companions: {
      friends: ['peas', 'radish', 'lettuce'],
      enemies: ['potato'],
    },
  },
  {
    id: 'zucchini',
    name: 'Zucchini',
    sfg_density: 1,
    planting_strategy: { start_window_start: 1, start_window_end: 6 },
    companions: {
      friends: ['radish'],
      enemies: ['potato'],
    },
  },
  {
    id: 'yellow-squash',
    name: 'Yellow Squash',
    sfg_density: 1,
    planting_strategy: { start_window_start: 1, start_window_end: 6 },
    companions: {
      friends: ['radish'],
      enemies: ['potato'],
    },
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    sfg_density: 1,
    planting_strategy: { start_window_start: 1, start_window_end: 6 },
    companions: {
      friends: [],
      enemies: ['potato'],
    },
  },
  {
    id: 'butternut-squash',
    name: 'Butternut Squash',
    sfg_density: 1,
    planting_strategy: { start_window_start: 1, start_window_end: 6 },
    companions: {
      friends: ['radish'],
      enemies: ['potato'],
    },
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    sfg_density: 1,
    planting_strategy: { start_window_start: 2, start_window_end: 6 },
    companions: {
      friends: ['radish'],
      enemies: [],
    },
  },

  // ===== HERBS (6) =====
  {
    id: 'basil',
    name: 'Basil',
    sfg_density: 4,
    planting_strategy: { start_window_start: 0, start_window_end: 6 },
    companions: {
      friends: ['tomato', 'cherry-tomato', 'pepper'],
      enemies: [],
    },
  },
  {
    id: 'cilantro',
    name: 'Cilantro',
    sfg_density: 4,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: {
      friends: ['spinach', 'lettuce'],
      enemies: [],
    },
  },
  {
    id: 'parsley',
    name: 'Parsley',
    sfg_density: 4,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: {
      friends: ['tomato', 'cherry-tomato', 'carrot'],
      enemies: [],
    },
  },
  {
    id: 'dill',
    name: 'Dill',
    sfg_density: 4,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: {
      friends: ['cabbage', 'lettuce', 'onion'],
      enemies: ['carrot'],
    },
  },
  {
    id: 'oregano',
    name: 'Oregano',
    sfg_density: 1,
    planting_strategy: { start_window_start: 0, start_window_end: 6 },
    companions: {
      friends: ['eggplant', 'pepper'],
      enemies: [],
    },
  },
  {
    id: 'thyme',
    name: 'Thyme',
    sfg_density: 4,
    planting_strategy: { start_window_start: -2, start_window_end: 4 },
    companions: {
      friends: ['eggplant', 'cabbage'],
      enemies: [],
    },
  },

]

/**
 * Lookup object for quick crop retrieval by ID
 */
export const CROPS_BY_ID: Record<string, Crop> = CORE_50_CROPS.reduce<Record<string, Crop>>(
  (acc, crop) => {
    acc[crop.id] = crop
    return acc
  },
  {}
)
