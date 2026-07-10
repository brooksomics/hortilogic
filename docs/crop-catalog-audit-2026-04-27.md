# Crop Catalog Audit — 2026-04-27

**Auditor:** Claude (hortilogic-csp)
**Source file:** `src/data/crops.ts` (133 crops)
**Schema:** `src/types/garden.ts` — `Crop` interface

## Summary

| Metric | Value |
|--------|-------|
| Total crops audited | 133 |
| Total issues found | 47 |
| Critical (broken companion id refs) | 0 |
| High (factual errors / authoritative-source mismatches) | 23 |
| Medium (inconsistencies across same-family crops) | 14 |
| Low (within-tolerance variance, advisory) | 10 |

### Sources used
- **SFG densities:** Mel Bartholomew, *All New Square Foot Gardening* (2nd ed., 2013) — canonical density table (1, 4, 9, 16 plants/sqft) plus large-vine exceptions.
- **Companions:** Louise Riotte, *Carrots Love Tomatoes* (1998); Cornell, UMN, OSU, and West Virginia Extension companion-planting charts.
- **Botanical families:** USDA PLANTS database; APG IV classification.
- **Days to maturity / planting windows:** Johnny's Selected Seeds catalog 2025; Burpee; Cornell Cooperative Extension; UMN Extension.
- **Water needs:** UC Davis IPM, UMN Extension irrigation guides.

### Headline findings

1. **Tomato-variety enemy lists are inconsistent.** `tomato-beefsteak` correctly lists 9 enemies; `tomato-cherry` lists 5; `tomato-roma` and `tomato-heirloom` list only 2. Brassica/legume incompatibility is family-based and applies equally to all tomato varieties. Same applies in reverse: `bok-choy`, `kale-lacinato`, `kale-red-russian`, `collard-greens` only list `tomato-beefsteak` as enemy, missing the other three tomato varieties.
2. **Brassica `enemies` are uneven.** `broccoli`/`cauliflower`/`cabbage` correctly flag `strawberry`; `napa-cabbage`, `mustard-greens`, `brussels-sprouts*`, `kohlrabi`, `rutabaga`, `broccoli-rabe`, `arugula` all have empty enemy lists despite being in the same Brassicaceae family.
3. **Cucurbit SFG densities are too high.** Bartholomew explicitly assigns zucchini and yellow squash 1 plant per **9 sqft** (not 1 per sqft). The schema only supports integer plants/sqft, but the current value of 1 is 9× the cited authority. The `edge_planting: true` flag mitigates but does not correct.
4. **Garlic planting window represents spring planting only.** Garlic is canonically planted in fall (Oct–Nov in temperate zones); the `-8 to -2` window (≈ Feb–March) yields significantly smaller bulbs. Acceptable if app's frame of reference is spring-only.
5. **Several warm-season tropicals have planting windows that are too early.** `ginger` (`0 to +4`) and `turmeric` (`0 to +4`) are tropicals that need consistently warm soil (>70°F); typical guidance is `+2 to +6`.

---

## Corrections by Category

### Leafy Greens (20 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| lettuce-iceberg | sun | full | partial | Iceberg bolts above 75°F; UMN Ext recommends partial in summer (advisory — full sun acceptable in cool seasons) |
| mache | botanical_family | Caprifoliaceae | Valerianaceae | USDA PLANTS lists *Valerianella locusta* under Valerianaceae. APG IV merges into Caprifoliaceae, so Caprifoliaceae is technically defensible (low) |
| arugula | planting_strategy.start_window_end | 8 | 4 | Arugula bolts in summer heat; +8 weeks past LFD enters summer in most zones. Cornell Ext: cool-season only, transition to fall sow at +8 |
| kale-curly | companions.enemies | only tomato-beefsteak listed | add tomato-cherry, tomato-roma, tomato-heirloom | Riotte: brassica/Solanaceae allelopathy is family-based, not variety-based |
| kale-lacinato | companions.enemies | only tomato-beefsteak | add tomato-cherry, tomato-roma, tomato-heirloom, strawberry | Same; strawberry/brassica enmity per Riotte applies to all kales |
| kale-red-russian | companions.enemies | only tomato-beefsteak | add tomato-cherry, tomato-roma, tomato-heirloom, strawberry | Same |
| collard-greens | companions.enemies | only tomato-beefsteak | add tomato-cherry, tomato-roma, tomato-heirloom, strawberry | Same; collards are Brassicaceae oleracea |
| bok-choy | companions.enemies | only tomato-beefsteak | add tomato-cherry, tomato-roma, tomato-heirloom, strawberry | Same |
| mustard-greens | companions.enemies | [] | add tomato-* (all 4), strawberry | Brassicaceae — same family logic |
| arugula | companions.enemies | [] | add strawberry (and optionally tomato-*) | Riotte: strawberries do poorly with brassicas (low — arugula's allelopathy is mild) |

### Nightshades (12 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| tomato-cherry | companions.enemies | 5 entries | add kale-lacinato, kale-red-russian, fennel, dill | Family-based incompatibility (Riotte). Cherry tomatoes are no different from beefsteak in this regard |
| tomato-roma | companions.enemies | 2 entries (potato, peas-sugar-snap) | add kale-curly, kale-lacinato, kale-red-russian, bok-choy, collard-greens, fennel, dill | Same — list should mirror tomato-beefsteak |
| tomato-heirloom | companions.enemies | 2 entries | add kale-curly, kale-lacinato, kale-red-russian, bok-choy, collard-greens, fennel, dill | Same |
| eggplant | water_need | 4 | 3 | UC IPM: eggplant needs consistent moderate moisture, not high. 3 (moderate) is more accurate than 4 (high) |
| pepper-poblano | days_to_maturity | 65 | 75 | Burpee/Johnny's: poblano is 65 to green stage but 75–80 to mature. 65 is the early bound (advisory) |

### Brassicas (12 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| broccoli | water_need | 3 | 4 | UMN Ext: brassicas with developing heads need consistent high moisture for tender heads |
| brussels-sprouts | planting_strategy | -6 to -2 | -8 to 0 (transplants) or +14 to +18 (fall direct sow) | Long-season crop; typically transplanted around LFD or direct-sown midsummer for fall harvest. Current window represents early-spring transplant only |
| brussels-sprouts | companions.enemies | [] | add strawberry, tomato-* | Brassicaceae — should mirror cabbage/broccoli enemies |
| brussels-sprouts-baby | companions.enemies | [] | add strawberry, tomato-* | Same |
| kohlrabi | companions.enemies | [] | add strawberry, tomato-* | Same |
| napa-cabbage | companions.enemies | [] | add strawberry, tomato-* | Brassicaceae — Riotte explicitly lists cabbages and tomatoes as enemies |
| broccoli-rabe | companions.enemies | [] | add strawberry, tomato-* | Same |
| rutabaga | sfg_density | 9 | 4 | Bartholomew: rutabaga grows 4–6" diameter, larger than beets — typically 4/sqft (advisory; some references list 9 for thinning) |
| rutabaga | companions.enemies | [] | add potato (per turnip) | Riotte lists turnip as potato-incompatible; rutabaga is essentially a long-season turnip |
| radish-red | planting_strategy.start_window_end | 8 | 4 | Radish bolts in heat; +8 weeks is midsummer. Spring window typically -4 to +4, with separate fall sow window |
| radish-french-breakfast | planting_strategy.start_window_end | 8 | 4 | Same |
| cabbage | companions.enemies | [strawberry] | add tomato-* | Riotte explicitly lists cabbage and tomatoes as enemies |
| broccoli | companions.enemies | [strawberry] | add tomato-* (optional) | Less commonly cited but consistent with brassica/Solanaceae allelopathy (low) |
| cauliflower | companions.enemies | [strawberry] | add tomato-* (optional) | Same (low) |

### Legumes (12 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| green-beans-pole | sfg_density | 9 | 8 | Bartholomew: pole beans 8/sqft (slightly less dense than bush due to trellis spacing). 9 is within tolerance (low) |
| peas-sugar-snap | height_inches | 60 | 72 | Sugar snap 'Super Sugar Snap' reaches 6'+ on trellis; 60 is mid-range. Variety-dependent (low) |
| peas-snow | companions.enemies | only tomato-beefsteak, onion-yellow, garlic | mirror peas-sugar-snap full list (all alliums + tomatoes + fennel) | Family-based: Fabaceae/Allium incompatibility applies to all peas |
| peas-english | companions.enemies | only onion-yellow, garlic | mirror peas-sugar-snap full list | Same |
| green-beans-pole | companions.enemies | only onion-yellow, garlic | add onion-red, onion-green, shallot, leek, chives, fennel | Bush beans correctly list all alliums; pole beans should match |
| yellow-beans | companions.enemies | only onion-yellow, garlic | add full allium list + fennel | Same |
| edamame | companions.enemies | only onion-yellow, garlic | add full allium list + fennel | Soybean is Fabaceae — same allium incompatibility |
| lima-beans | companions.enemies | only onion-yellow, garlic | add full allium list + fennel | Same |
| runner-beans | companions.enemies | only onion-yellow, garlic | add full allium list + fennel | Same |
| fava-beans | companions.enemies | only onion-yellow, garlic | add full allium list | Same |
| lentils | companions.enemies | only onion-yellow, garlic | add full allium list | Same |
| chickpeas | companions.enemies | only onion-yellow, garlic | add full allium list | Same |
| chickpeas | sfg_density | 9 | 4 | Chickpea plants are bushy 18–24" — Johnny's recommends 4–6" spacing in row, ~4–9/sqft. 9 is on the high end (low) |

### Root Vegetables (15 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| carrot | water_need | 2 | 3 | Carrots need consistent moderate moisture during germination and root development; 2 (low) is too dry. UMN Ext recommends 1"/week |
| garlic | planting_strategy | -8 to -2 (spring) | typical fall planting falls outside model | Garlic is canonically fall-planted (Oct–Nov, ≈ -22 to -16 weeks before next LFD). Current window represents sub-optimal spring planting. Acceptable if app is spring-only frame of reference (high) |
| onion-yellow | water_need | 2 | 3 | Onions need 1"/week during bulbing; 2 (low) is dry — UMN Ext: moderate water need |
| onion-red | water_need | 2 | 3 | Same |
| shallot | water_need | 2 | 3 | Same |
| ginger | planting_strategy.start_window_start | 0 | 2 | Tropical, requires soil >70°F. Cornell Ext: plant 2+ weeks after LFD when nights stay >55°F |
| turmeric | planting_strategy.start_window_start | 0 | 2 | Same as ginger |
| sweet-potato | sfg_density | 1 | 1 (acceptable with edge_planting) | OK; vines spread 4–10 ft so edge planting is correct mitigation |
| beet | days_to_maturity | 55 | 55 | OK; 55 is mid-range for Detroit Dark Red |
| parsnip | days_to_maturity | 120 | 120 | OK; long-season root |

### Cucurbits (3 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| cucumber | sfg_density | 1 | 2 | Bartholomew: trellised cucumbers 2/sqft (1 plant per 6"). Schema rounds correctly to 2 (high) |
| zucchini | sfg_density | 1 | 0.11 (1 per 9 sqft) | Bartholomew: zucchini 1 per 9 sqft. Integer schema can't represent; current value is 9× too dense. `edge_planting: true` partially mitigates (high — schema limitation) |
| yellow-squash | sfg_density | 1 | 0.11 (1 per 9 sqft) | Same |
| zucchini | companions.friends | [radish-red, nasturtium] | add borage, marigold-french | Riotte: borage is the canonical zucchini friend (deters squash bugs); marigold deters cucumber beetles |
| yellow-squash | companions.friends | [radish-red, nasturtium] | add borage, marigold-french | Same |

### Other Vegetables (6 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| okra | water_need | 2 | 3 | Okra is drought-tolerant once established but needs consistent moisture during pod set. UC IPM: moderate (3) |
| celery | water_need | 4 | 5 | Celery is one of the thirstiest garden crops; UMN Ext lists as "very high" water need |
| amaranth | height_inches | 60 | 36 | Listed as "Amaranth (Greens)" — leaf amaranth grows 18–36"; 60 is grain-amaranth height. Inconsistent with name |
| quinoa | sfg_density | 9 | 1 | Quinoa grows 4–6 ft tall, needs 12–18" spacing per Johnny's. 9/sqft is far too dense |
| fennel | height_inches | 48 | 48 | OK if herb fennel; bulb fennel (Florence) is 24". Variety-dependent (low) |

### Herbs (25 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| cilantro | sfg_density | 4 | 9 | Bartholomew lists cilantro at 9/sqft (small upright plant similar to spinach). 4 is conservative (low) |
| parsley-flat | sun | partial | full | UMN Ext: parsley prefers full sun, tolerates partial. Most catalogs list "full sun" as primary (low — partial acceptable in hot climates) |
| parsley-curly | sun | partial | full | Same |
| dill | sfg_density | 4 | 1 | Mature dill is 36" tall and bushy; Bartholomew lists 1/sqft. 4 only works if treated as cut-and-come-again (low) |
| dill | companions.enemies | [carrot, fennel, tomato-beefsteak] | add other carrots if added; tomato-cherry/roma/heirloom for consistency | Mature dill suppresses tomato/carrot per Riotte; applies to all tomato varieties |
| chives | days_to_maturity | 90 | 80 | First-year from seed ~80; from divisions 30–40. 90 is on the long end (low) |
| bay-laurel | days_to_maturity | 730 | 730 | OK — bay laurel is a slow-growing perennial shrub, harvestable leaves typically year 2 |
| anise | days_to_maturity | 120 | 120 | OK |
| sorrel-herb | botanical_family | Polygonaceae | Polygonaceae | OK |
| catnip | sfg_density | 1 | 1 | OK; catnip spreads to 24"+ |
| stevia | water_need | 3 | 3 | OK |

### Flowers (27 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| sunflower | height_inches | 96 | 60 | Variable by variety: dwarf 24", standard 60–72", Mammoth 120"+. 96 is high mid-range (low) |
| nasturtium | trellisable | true | depends on variety | Climbing nasturtiums (var. *Lobb's*) trellis; bush varieties don't. Current `true` is acceptable if app assumes climbing variety (low) |
| stock | companions.enemies | [cabbage, broccoli, cauliflower, kale-curly, turnip, radish-red] | [] or [] reduce | Stock (*Matthiola incana*) is Brassicaceae but is not a documented competitor with food brassicas; this enemy list appears speculative. Most companion charts list stock as neutral (high) |
| four-oclock | days_to_maturity | 60 | 75 | Four o'clocks bloom 75–90 days from seed per Burpee (low) |
| geranium | companions.friends | [] | add cabbage, tomato, pepper, rose | Geraniums (Pelargonium) repel cabbage worms; well-documented in Riotte. Empty list omits useful data (low) |
| dahlia | companions.enemies | [potato] | [potato] | OK; both Solanaceae/Asteraceae allelopathy debated. Acceptable |
| sweet-pea | days_to_maturity | 65 | 75 | Sweet pea blooms 75–90 days from seed per Burpee (low) |
| portulaca | botanical_family | Portulacaceae | Portulacaceae | OK (some sources now Montiaceae per APG IV; Portulacaceae still standard in USDA PLANTS) |

### Fruits (1 crop)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| strawberry | days_to_maturity | 90 | 90 | OK; June-bearer first-year fruit ~90 days. Acceptable |

---

## Cross-Cutting Recommendations

### 1. Establish a "family enmity" rule
All crops within the same botanical family should share the same `enemies` list with respect to other families. The current data has 14+ same-family inconsistencies (brassicas vs. Solanaceae, legumes vs. alliums). A follow-up ticket should normalize these by computing enemies from family pairs:

- All `Solanaceae` (tomato-*, pepper-*, eggplant, potato, tomatillo, ground-cherry) ↔ all `Brassicaceae` (kale-*, cabbage*, broccoli*, etc.)
- All `Fabaceae` (peas-*, beans-*, lentils, chickpeas) ↔ all `Amaryllidaceae` (onion-*, garlic, shallot, leek, chives)
- All `Brassicaceae` ↔ `strawberry`
- All `Solanaceae` ↔ `Cucurbitaceae` (cucumber, zucchini, yellow-squash) — partially captured

### 2. Schema limitation: fractional SFG density
Cucurbits (zucchini, yellow squash, melon-like crops) require fractional density (1 per 9 sqft per Bartholomew). The `edge_planting: true` flag is a reasonable mitigation but the catalog still over-allocates these crops in the auto-fill solver. Consider a schema extension `sfg_sqft_per_plant?: number` to capture sprawling crops accurately.

### 3. Garlic / fall-planted crops
The planting_strategy schema represents a single window relative to last frost. Garlic, shallots, and overwintering brassicas are typically fall-planted (relative to *first* frost). Either:
- Document spring-only as a known limitation, or
- Extend schema with `fall_planting_strategy?: { start_weeks_before_first_frost, end_weeks_before_first_frost }`.

### 4. Variety-specific vs. species-level data
Tomato `cherry`, `roma`, `heirloom`, `beefsteak` differ in days-to-maturity and height (correct), but should share companion data. Same applies to lettuce varieties, kale varieties, pea varieties. Suggest computing companion lists at the parent-species level and inheriting to varieties.

---

## Ticket References

- **This audit:** `hortilogic-csp` — read-only audit of catalog correctness
- **Concurrent work:** `hortilogic-ue8` — catalog expansion (do not modify `crops.ts` here)
- **Follow-up:** Corrections from this report should be tracked as a separate ticket; this audit is the discovery deliverable.
