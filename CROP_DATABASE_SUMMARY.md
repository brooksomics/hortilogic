# Comprehensive Crop Database V2

## Overview
Generated: 2026-01-18
Total Crops: **162** (exceeds minimum of 100, approaching target of 200)

## Database Statistics

### By Type
- **Vegetables**: 108 crops
- **Herbs**: 25 crops
- **Flowers**: 30 crops (exceeds minimum of 10)

### By Category

#### Leafy Greens (20 varieties)
- Butterhead, Romaine, Leaf, Iceberg Lettuce
- Spinach
- Curly, Lacinato, Red Russian Kale
- Arugula, Bok Choy, Collard Greens, Mustard Greens
- Rainbow & Green Swiss Chard
- Endive, Radicchio, Watercress, Mizuna, Tatsoi, Mache, Sorrel

#### Nightshades (12 varieties)
- Beefsteak, Cherry, Roma, Heirloom Tomato
- Bell, Jalapeño, Habanero, Poblano Pepper
- Eggplant, Potato, Tomatillo, Ground Cherry

#### Brassicas (15 varieties)
- Broccoli, Broccoli Rabe, Rapini
- Cauliflower
- Cabbage, Napa Cabbage, Chinese Cabbage
- Brussels Sprouts, Baby Brussels Sprouts
- Kohlrabi
- Red, Daikon, Watermelon, French Breakfast Radish
- Turnip, Rutabaga
- Horseradish

#### Legumes (12 varieties)
- Sugar Snap, Snow, English Peas
- Bush Green Beans, Pole Green Beans, Yellow Wax Beans, Runner Beans
- Fava Beans, Lima Beans
- Edamame, Lentils, Chickpeas

#### Root Vegetables (18 varieties)
- Carrot, Beet
- Yellow, Red, Green Onion
- Garlic, Shallot, Leek
- Parsnip, Sweet Potato
- Ginger, Turmeric
- Celeriac, Jerusalem Artichoke, Jicama, Yacon

#### Cucurbits (12 varieties)
- Cucumber, Zucchini, Yellow Squash
- Butternut, Acorn, Spaghetti, Delicata Squash
- Pumpkin
- Watermelon, Cantaloupe, Honeydew
- Luffa

#### Other Vegetables (10 varieties)
- Sweet Corn
- Asparagus, Artichoke
- Celery, Fennel
- Okra, Rhubarb
- Amaranth, Quinoa

#### Herbs (25 varieties)
- Sweet Basil, Thai Basil
- Cilantro
- Flat-leaf Parsley, Curly Parsley
- Dill
- Oregano, Thyme, Marjoram
- Spearmint, Peppermint
- Chives
- Sage, Rosemary, Lavender
- Chamomile, Tarragon
- Lemon Balm, Lemongrass
- Catnip, Stevia
- Bay Laurel, French Sorrel, Lovage, Anise

#### Flowers - Beneficial Companions (30 varieties)
- French Marigold, African Marigold *(pest deterrent)*
- Nasturtium *(aphid trap, edible)*
- Borage *(pollinator attractor)*
- Calendula *(pest deterrent, medicinal)*
- Sweet Alyssum *(beneficial insect attractor)*
- Sunflower, Zinnia, Cosmos
- Petunia, Chrysanthemum
- Bachelor Button, Four O'Clock
- Geranium, Peony, Rose
- Snapdragon, Pansy, Viola
- Hollyhock, Dahlia, Dianthus, Stock
- Sweet Pea, Ageratum, Lobelia
- Salvia, Verbena, Portulaca, Strawflower

#### Fruits & Berries (8 varieties)
- Strawberry
- Blueberry, Raspberry, Blackberry
- Currant, Gooseberry
- Grape, Fig

## V2 Schema Features

Every crop includes:
1. **Type Classification**: `'vegetable' | 'herb' | 'flower'`
2. **Botanical Family**: Scientific family name (e.g., "Solanaceae", "Brassicaceae", "Lamiaceae")
3. **Sun Requirements**: `'full' | 'partial' | 'shade'`
4. **Days to Maturity**: Typical growing time in days
5. **SFG Density**: Square Foot Gardening spacing (1, 4, 9, or 16 per sq ft)
6. **Planting Strategy**: Frost-relative planting windows
7. **Companion Rules**: Friend/enemy relationships for companion planting

## Data Quality

✅ **All 162 crops have complete V2 schema fields**
- botanical_family: 162/162 ✓
- sun: 162/162 ✓
- days_to_maturity: 162/162 ✓
- type: 162/162 ✓

## Next Steps

1. **TODO-026**: Update `Crop` interface in `garden.ts` to add V2 fields
2. **TODO-027**: Replace `CORE_50_CROPS` with `CROP_DATABASE` from this file
3. **TODO-028**: Refactor CropLibrary UI to support type/family filtering
4. **TODO-029**: Update companion engine to recognize flower benefits

## File Location

Comprehensive database: `/src/data/crops-v2-comprehensive.ts`

## Helper Functions Included

```typescript
export function getCropsByType(type: 'vegetable' | 'herb' | 'flower'): Crop[]
export function getCropsByFamily(family: string): Crop[]
export function getAllFamilies(): string[]
export const DATABASE_STATS // Summary statistics
```
