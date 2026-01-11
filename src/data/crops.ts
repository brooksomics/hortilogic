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
    emoji: '🥬',
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
    emoji: '🥬',
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
    emoji: '🥬',
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
    emoji: '🥗',
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
    emoji: '🥬',
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
    emoji: '🥬',
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
    emoji: '🥬',
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
    emoji: '🥬',
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
    emoji: '🥗',
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
    emoji: '🥗',
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
    emoji: '🍅',
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
    emoji: '🍅',
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
    emoji: '🌶️',
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
    emoji: '🍆',
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
    emoji: '🥔',
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
    emoji: '🍅',
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
    emoji: '🥦',
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
    emoji: '🥦',
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
    emoji: '🥬',
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
    emoji: '🥬',
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
    emoji: '🥬',
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
    emoji: '🥕',
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
    emoji: '🥕',
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
    emoji: '🥕',
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
    emoji: '🫛',
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
    emoji: '🫘',
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
    emoji: '🫘',
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
    emoji: '🫘',
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
    emoji: '🫘',
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
    emoji: '🫛',
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
    emoji: '🥕',
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
    emoji: '🥕',
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
    emoji: '🧅',
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
    emoji: '🧄',
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
    emoji: '🥕',
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
    emoji: '🧅',
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
    emoji: '🧅',
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
    emoji: '🌿',
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
    emoji: '🥒',
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
    emoji: '🥒',
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
    emoji: '🥒',
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
    emoji: '🎃',
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
    emoji: '🥒',
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
    emoji: '🍉',
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
    emoji: '🌿',
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
    emoji: '🌿',
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
    emoji: '🌿',
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
    emoji: '🌿',
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
    emoji: '🌿',
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
    emoji: '🌿',
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
