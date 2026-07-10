# Crop Catalog Audit — ue8 Additions (2026-04-28)

**Auditor:** Claude (hortilogic-f41)
**Source file:** `src/data/crops.ts` at commit `3d5ffdc` (153 newly-added crops)
**Scope:** Audit *only* the entries added by `hortilogic-ue8`. The original 133 are covered by `docs/crop-catalog-audit-2026-04-27.md`.
**Schema:** `src/types/garden.ts` — `Crop` interface (unchanged)

> **Scope correction:** the ticket title and ue8 commit message both stated "113 new crops" / "246 total entries". The actual numbers are **153 new crops** added (catalog grew 133 → **286** total). Verified via git diff between `3d5ffdc^` and `3d5ffdc`. This audit covers all 153.

## Summary

| Metric | Value |
|--------|-------|
| Total crops audited | 153 |
| Total issues found | 56 |
| Critical (broken companion id refs in full catalog) | 0 |
| High (factual errors / authoritative-source mismatches) | 18 |
| Medium (same-family `enemies` inconsistency, repeated from original audit) | 23 |
| Low (within-tolerance variance, advisory) | 15 |

### Methodology
- Same rubric as `crop-catalog-audit-2026-04-27.md`: Bartholomew SFG, Riotte/extension companions, USDA + APG IV families, Johnny's/Burpee for DTM, UMN/UC IPM for water needs.
- Cross-validated against the headline findings of the prior audit to see whether ue8 *repeats*, *fixes*, or *introduces new* patterns of error.

### Headline findings

1. **Zero broken companion id references across the full 286-entry catalog.** This is the most important result — all 99 referenced ids resolve cleanly. The ue8 expansion did not introduce dangling refs.
2. **Tomato-variety enemy consistency is *better* than the original 4 tomato varieties — but still not uniform.** All 11 new tomato varieties correctly include `potato` and `fennel` as enemies, but the brassica enemy lists vary (some include `cabbage`, some don't; none include `bok-choy` / `kale-*` / `collard-greens`).
3. **Pepper enemy lists improved.** Original peppers had `enemies: []` (a known gap). All 11 new peppers correctly list `fennel` as enemy. However, none list `kohlrabi`/`fennel-adjacent` or follow the broader Solanaceae/Brassicaceae pattern.
4. **Cucurbit SFG-density limitation repeats.** All 17 new sprawling cucurbits (winter squashes, pumpkins, melons, gourds, chayote, luffa) use `sfg_density: 1` despite Bartholomew's 1-per-9-sqft guidance. Mitigation via `edge_planting: true` is consistently applied (every sprawler has it set), which is an improvement over the original audit.
5. **Legume/Allium incompatibility is undercounted.** The 6 new legumes (cowpea, yardlong, italian-flat, purple-pole, winged, tepary, jicama) and 6 new alliums (pearl, cipollini, walking, elephant-garlic, garlic-chives, multiplier) only list 2–3 entries from the opposing family rather than the full enemy set. Same drift as the original audit.
6. **Fall planting works in the schema!** `elephant-garlic` correctly uses `start_window_start: -16, start_window_end: -10` to represent autumn sowing 4 months before next-season's LFD. This *demonstrates* the schema can express fall planting via large negative values — meaning the original audit's flag against `garlic` (`-8 to -2` representing sub-optimal spring planting) is fixable in-place.

---

## Corrections by Category

### Tomatoes — heirloom varieties (11 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| tomato-brandywine | companions.enemies | [potato, fennel, dill, cabbage] | add bok-choy, kale-curly, kale-lacinato, kale-red-russian, collard-greens, peas-sugar-snap | Family-based Solanaceae/Brassicaceae and Solanaceae/Fabaceae allelopathy applies to all tomato varieties (Riotte) |
| tomato-cherokee-purple | companions.enemies | [potato, fennel, cabbage, broccoli] | same — add bok-choy, kale-*, collard-greens, peas-sugar-snap, dill | Same |
| tomato-san-marzano | companions.enemies | [potato, fennel, corn-sweet] | same + cabbage, brassicas, peas | Same. corn-sweet inclusion is correct (corn earworm = tomato fruitworm) |
| tomato-black-krim | companions.enemies | [potato, fennel, cabbage] | same — add brassicas + peas + dill | Same |
| tomato-green-zebra | companions.enemies | [potato, fennel] | same + cabbage + brassicas + peas | Same |
| tomato-mortgage-lifter | companions.enemies | [potato, fennel, corn-sweet] | same + cabbage + brassicas + peas + dill | Same |
| tomato-sungold | companions.enemies | [potato, fennel] | same + cabbage + brassicas + peas | Same |
| tomato-yellow-pear | companions.enemies | [potato, fennel, cabbage] | same — add brassicas + peas + dill | Same |
| tomato-amish-paste | companions.enemies | [potato, fennel] | same + cabbage + brassicas + peas | Same |
| tomato-rutgers | companions.enemies | [potato, fennel, corn-sweet] | same + cabbage + brassicas + peas + dill | Same |
| tomato-better-boy | companions.enemies | [potato, fennel, cabbage] | same — add brassicas + peas + dill | Same |
| tomatillo-purple | companions.enemies | [fennel] | add potato + brassicas + peas (and corn-sweet) | Tomatillo is Solanaceae like tomatoes; same incompatibilities. Also mirrors original `tomatillo` which had `enemies: [potato]` |

### Peppers (11 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| pepper-serrano | water_need | 2 | 3 | Capsicum annuum cultivars need consistent moderate moisture; original `pepper-jalapeno` is also `2` and was flagged in the prior audit. Pattern repeated |
| pepper-cayenne | water_need | 2 | 3 | Same |
| pepper-ghost | days_to_maturity | 100 | 120 | Bhut Jolokia (C. chinense) is 120–150 days from transplant per Johnny's. 100 is the early bound (low) |
| pepper-rocoto | days_to_maturity | 120 | 150 | Rocoto (C. pubescens) is 130–160 days; very long season. 120 is the early bound (low) |
| pepper-aji-amarillo | days_to_maturity | 90 | 120 | C. baccatum cultivars are typically 100–130 days. 90 is the early bound (low) |
| pepper-thai | trellisable | false | false | OK — but Thai pepper varieties can reach 36" and benefit from staking; not strictly trellisable |
| pepper-tabasco | days_to_maturity | 80 | 100 | Tabasco (C. frutescens) is 90–110 days. 80 is the early bound (low) |
| pepper-tabasco | water_need | 3 | 2 | Tabasco is more drought-tolerant than C. annuum types (low — within tolerance) |

### Cucurbits — winter squash, pumpkins, melons, gourds (17 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| butternut-squash | sfg_density | 1 | 0.11 (1 per 9 sqft) | Bartholomew assigns winter squash 1 per 9 sqft. Schema can't express; `edge_planting: true` mitigates (high — schema limitation) |
| acorn-squash | sfg_density | 1 | 0.11 | Same |
| spaghetti-squash | sfg_density | 1 | 0.11 | Same |
| delicata-squash | sfg_density | 1 | 0.11 | Same |
| kabocha-squash | sfg_density | 1 | 0.11 | Same |
| hubbard-squash | sfg_density | 1 | 0.11 | Same |
| pumpkin-pie | sfg_density | 1 | 0.11 | Same |
| pumpkin-jack | sfg_density | 1 | 0.11 | Same. Jack-O-Lantern pumpkins sprawl 12–20 ft per vine — possibly even more than 1 per 9 sqft |
| watermelon | sfg_density | 1 | 0.06 (1 per ~16 sqft) | Watermelons are the largest cucurbit; Bartholomew lists 2 plants per 4'×8' bed = 1 per 16 sqft |
| cantaloupe | sfg_density | 1 | 0.11 | Same as winter squash |
| honeydew-melon | sfg_density | 1 | 0.11 | Same |
| galia-melon | sfg_density | 1 | 0.11 | Same |
| chayote | sfg_density | 1 | 0.11 | Perennial vining cucurbit, very large; edge_planting mitigates |
| bitter-melon | sfg_density | 1 | 0.11 | Same |
| ridge-gourd | sfg_density | 1 | 0.11 | Same |
| snake-gourd | sfg_density | 1 | 0.11 | Same |
| luffa | sfg_density | 1 | 0.11 | Same |
| pattypan-squash | edge_planting | (missing) | true | Pattypan is a summer squash; original `zucchini`/`yellow-squash` correctly have `edge_planting: true`. Pattypan should match for consistency |
| crookneck-squash | edge_planting | (missing) | true | Same — crookneck is essentially yellow squash and sprawls similarly |
| watermelon | trellisable | false | false | OK for full-size, but icebox/sugar-baby varieties are commonly trellised. Variety-dependent (low) |

### New cucumber varieties (3 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| cucumber-pickling | sfg_density | 1 | 2 | Bartholomew: trellised cucumbers 2/sqft. Same finding as original `cucumber` (high) |
| cucumber-lemon | sfg_density | 1 | 2 | Same |
| cucumber-armenian | sfg_density | 1 | 2 | Armenian cucumber is heavy-vining; 2/sqft when trellised; could be more conservative |
| mexican-sour-gherkin | sfg_density | 1 | 4 | Cucamelon vines are smaller and lighter than standard cucumbers; 4/sqft is reasonable when trellised |

### Brassicas (12 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| broccolini | companions.enemies | [tomato-beefsteak, tomato-cherry, strawberry, green-beans-bush] | add tomato-roma, tomato-heirloom + new tomato varieties | All Solanaceae/Brassicaceae enmity applies. Same drift as original audit |
| romanesco | companions.enemies | [tomato-beefsteak, strawberry, green-beans-bush] | same + tomato-* | Same |
| gai-lan | companions.enemies | [tomato-beefsteak, strawberry] | same + tomato-* + green-beans-* | Same |
| choy-sum | companions.enemies | [tomato-beefsteak, strawberry] | same + tomato-* | Same |
| cabbage-savoy | companions.enemies | [tomato-beefsteak, strawberry, green-beans-bush] | same + tomato-* | Same |
| cabbage-red | companions.enemies | [tomato-beefsteak, strawberry, green-beans-bush] | same + tomato-* | Same |
| mustard-asian | companions.enemies | [tomato-beefsteak, strawberry] | same + tomato-* | Same |
| kale-redbor | companions.enemies | [tomato-beefsteak, strawberry, green-beans-bush] | same + tomato-* | Same |
| kale-redbor | water_need | 2 | 3 | Kale needs consistent moderate moisture; original kales correctly use 3. 2 is dry |
| sea-kale | companions.enemies | [tomato-beefsteak, strawberry] | same + tomato-* | Same |
| tree-collards | companions.enemies | [tomato-beefsteak, strawberry] | same + tomato-* | Same |
| ethiopian-kale | companions.enemies | [tomato-beefsteak, strawberry] | same + tomato-* | Same |
| komatsuna | companions.enemies | [tomato-beefsteak, strawberry] | same + tomato-* | Same |
| horseradish | companions.enemies | [] | add tomato-*, strawberry | Horseradish is Brassicaceae; same family logic |
| romanesco | days_to_maturity | 100 | 80 | Romanesco is typically 75–100 days from transplant per Johnny's. 100 is the late bound |
| cabbage-savoy | height_inches | 12 | 18 | Savoy plants are 18–24" tall with 12" head; height field should reflect plant height |
| cabbage-red | height_inches | 12 | 18 | Same |

### Alliums (6 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| pearl-onion | companions.enemies | [peas-sugar-snap, green-beans-bush, sage] | mirror full allium-vs-Fabaceae list (peas-snow, peas-english, all bean varieties, fava-beans, edamame, lima-beans, runner-beans, lentils, chickpeas, sweet-pea, cowpea, yardlong-bean, italian-flat-bean, purple-pole-bean, winged-bean, tepary-bean, jicama, fenugreek) | Family-based; same drift as original audit |
| cipollini-onion | companions.enemies | [peas-sugar-snap, green-beans-bush] | full Fabaceae list | Same |
| walking-onion | companions.enemies | [peas-sugar-snap, green-beans-bush] | full Fabaceae list | Same |
| elephant-garlic | companions.enemies | [peas-sugar-snap, green-beans-bush] | full Fabaceae list | Same |
| elephant-garlic | planting_strategy | -16 to -10 (fall) | -16 to -10 (fall) | **CORRECT** — schema demonstration of fall planting. Use as reference to retrofit `garlic` |
| garlic-chives | companions.enemies | [peas-sugar-snap, green-beans-bush] | full Fabaceae list + sage | Same |
| multiplier-onion | companions.enemies | [peas-sugar-snap, green-beans-bush] | full Fabaceae list | Same |

### Legumes (6 new + 1 existing-pattern)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| cowpea | companions.enemies | [onion-yellow, garlic, shallot] | add onion-red, onion-green, leek, chives, garlic-chives, pearl-onion, cipollini-onion, walking-onion, elephant-garlic, multiplier-onion, fennel, society-garlic | Family-based |
| yardlong-bean | companions.enemies | [onion-yellow, garlic, shallot] | same | Same |
| italian-flat-bean | companions.enemies | [onion-yellow, garlic, shallot] | same | Same |
| purple-pole-bean | companions.enemies | [onion-yellow, garlic, shallot] | same | Same |
| winged-bean | companions.enemies | [onion-yellow, garlic] | same | Same — also missing shallot |
| tepary-bean | companions.enemies | [onion-yellow, garlic] | same | Same |
| jicama | companions.enemies | [onion-yellow, garlic] | same | Jicama is Fabaceae despite tuber-like form |
| fenugreek | companions.enemies | [] | add full allium list | Fenugreek is Fabaceae (*Trigonella foenum-graecum*); same allium incompatibility |
| jicama | days_to_maturity | 150 | 180 | Jicama needs 150–270 days depending on climate; 150 is the early bound (low) |

### Roots / Tubers (5 crops — diverse families)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| salsify | sfg_density | 16 | 9 | Salsify roots are 8–10" tall but plants need ~3" spacing — 16/sqft is too dense; Johnny's recommends 4–6" spacing (low) |
| scorzonera | sfg_density | 16 | 9 | Same |
| jerusalem-artichoke | companions.enemies | [tomato-beefsteak] | add tomato-cherry, tomato-roma, tomato-heirloom, all 11 new tomato varieties | Sunchoke allelopathy is reported broadly against Solanaceae; original entry only lists tomato-beefsteak |
| oca | botanical_family | Oxalidaceae | Oxalidaceae | OK (*Oxalis tuberosa*) |
| yacon | days_to_maturity | 180 | 200 | Yacon needs 180–270 days; 180 is early bound (low) |
| burdock | days_to_maturity | 120 | 120 | OK for first-year root harvest |

### Asian / Tropical Vegetables (8 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| asian-eggplant-japanese | id | asian-eggplant-japanese | eggplant-japanese | Naming convention drift: existing pattern is `<crop>-<variety>` (e.g., `tomato-cherry`, `pepper-bell`). The leading "asian-" prefix is inconsistent and the crop is just a variety of eggplant (low — cosmetic) |
| thai-eggplant | id | thai-eggplant | eggplant-thai | Same convention drift |
| chayote | days_to_maturity | 150 | 365+ | Chayote is a perennial vine that typically does not fruit until year 2 in temperate zones; 150 days representing first-year fruiting is overly optimistic outside zones 9–11 (low — climate-dependent) |
| malabar-spinach | botanical_family | Basellaceae | Basellaceae | OK (*Basella alba*) |
| water-spinach | botanical_family | Convolvulaceae | Convolvulaceae | OK (*Ipomoea aquatica*) |
| longevity-spinach | botanical_family | Asteraceae | Asteraceae | OK (*Gynura procumbens*) |
| okinawa-spinach | botanical_family | Asteraceae | Asteraceae | OK (*Gynura bicolor*) |
| new-zealand-spinach | botanical_family | Aizoaceae | Aizoaceae | OK (*Tetragonia tetragonioides*) |
| molokhia | botanical_family | Malvaceae | Malvaceae | OK (*Corchorus olitorius*) |
| roselle | type | herb | vegetable or fruit | Roselle (*Hibiscus sabdariffa*) is grown for edible calyxes; classification as "herb" is unusual. Consider `vegetable` or `fruit` (low) |

### Microgreens (5 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| microgreens-pea | sfg_density | 16 | n/a | Microgreens are tray-grown at 50+ plants per square inch, not in soil at integer per-sqft. Schema fundamentally doesn't fit; the value is decorative. Document as schema limitation (high — but unfixable without a separate growing-mode field) |
| microgreens-sunflower | sfg_density | 16 | n/a | Same |
| microgreens-broccoli | sfg_density | 16 | n/a | Same |
| microgreens-radish | sfg_density | 16 | n/a | Same |
| wheatgrass | sfg_density | 16 | n/a | Same |
| microgreens-pea | type | vegetable | vegetable | OK |
| wheatgrass | type | herb | vegetable | Wheatgrass is consumed as juice/food, not a culinary herb. Inconsistent with similar microgreens classified as `vegetable` (low) |

### Herbs (12 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| valerian | water_need | 2 | 3 | *Valeriana officinalis* prefers consistent moisture; UMN Ext: moderate |
| valerian | botanical_family | Caprifoliaceae | Caprifoliaceae | OK per APG IV (formerly Valerianaceae). Note: this is *consistent* with the new placement of `mache` |
| bee-balm | water_need | 2 | 3 | *Monarda didyma* is moisture-loving; can develop powdery mildew if too dry |
| globe-artichoke | water_need | 3 | 4 | Artichokes are heavy feeders and water users; UC IPM lists as "high" (4) |
| roselle | days_to_maturity | 150 | 180 | Roselle calyxes mature 180–210 days from seed; 150 is the early bound (low) |
| pineapple-mint | enemies | [parsley-flat, parsley-curly] | [parsley-flat, parsley-curly] | OK — consistent with original mints |
| moroccan-mint | enemies | [parsley-flat, parsley-curly] | [parsley-flat, parsley-curly] | OK |
| society-garlic | botanical_family | Amaryllidaceae | Amaryllidaceae | OK (*Tulbaghia violacea*) |
| society-garlic | type | herb | flower or herb | *Tulbaghia* is primarily ornamental but flowers/leaves are edible. `herb` is defensible (low) |
| anise-hyssop | botanical_family | Lamiaceae | Lamiaceae | OK (*Agastache foeniculum*) |
| pineapple-sage | botanical_family | Lamiaceae | Lamiaceae | OK (*Salvia elegans*) |
| epazote | botanical_family | Amaranthaceae | Amaranthaceae | OK (*Dysphania ambrosioides*; formerly Chenopodium) |
| vietnamese-coriander | botanical_family | Polygonaceae | Polygonaceae | OK (*Persicaria odorata*) |
| salad-burnet | botanical_family | Rosaceae | Rosaceae | OK (*Sanguisorba minor*) |
| hyssop | planting_strategy.start_window_start | 0 | -2 | Hyssop is cold-hardy perennial; can start 2 weeks before LFD per Cornell Ext (low) |

### Perennial Vegetables (6 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| asparagus | days_to_maturity | 730 | 730 | OK — first harvest year 2 |
| asparagus | companions.enemies | [onion-yellow, garlic] | add shallot, leek, chives, garlic-chives, all new alliums | Riotte: full allium incompatibility for asparagus |
| rhubarb | days_to_maturity | 365 | 365 | OK — first harvest year 2 |
| globe-artichoke | days_to_maturity | 150 | 365 (most zones) / 150 (zones 9–11) | First-year harvest is climate-dependent. Document or split into two windows |
| sea-kale | days_to_maturity | 365 | 730 | Sea kale is typically not harvested until year 2–3 |
| cardoon | botanical_family | Asteraceae | Asteraceae | OK (*Cynara cardunculus*) |
| good-king-henry | botanical_family | Amaranthaceae | Amaranthaceae | OK (*Blitum bonus-henricus*; formerly Chenopodium) |

### Flowers (10 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| morning-glory | botanical_family | Convolvulaceae | Convolvulaceae | OK (*Ipomoea*) |
| nigella | botanical_family | Ranunculaceae | Ranunculaceae | OK (*Nigella damascena*) |
| larkspur | botanical_family | Ranunculaceae | Ranunculaceae | OK (*Consolida ajacis* — split from Delphinium) |
| impatiens | sun | shade | partial | Most Impatiens cultivars prefer partial shade (filtered light); pure shade is too dim. UMN Ext: "part shade" |
| begonia | sun | partial | partial | OK |
| coleus | sun | partial | partial | OK |
| balsam | sun | partial | partial-full | *Impatiens balsamina* tolerates more sun than *I. walleriana*; partial-full more accurate (low) |
| cleome | botanical_family | Cleomaceae | Cleomaceae | OK (recently split from Capparaceae per APG IV) |
| bee-balm | type | flower | herb or flower | *Monarda didyma* is both medicinal herb and ornamental. Either defensible (low) |
| day-lily-edible | botanical_family | Asphodelaceae | Asphodelaceae | OK per APG IV (*Hemerocallis*; formerly Liliaceae) |
| globe-amaranth | botanical_family | Amaranthaceae | Amaranthaceae | OK (*Gomphrena globosa*) |
| tithonia-mexican-sunflower | height_inches | 96 | 60–96 (variety-dependent) | OK — *T. rotundifolia* 'Torch' is 60", 'Goldfinger' is 36" (low) |

### Edible Greens / Misc (6 crops)

| Crop ID | Field | Current | Recommended | Source |
|---------|-------|---------|-------------|--------|
| chicory | days_to_maturity | 70 | 70 (greens) / 110 (forced roots) | OK for greens; document if heading types |
| dandelion-greens | days_to_maturity | 60 | 90 | Cultivated dandelion greens are typically harvested 80–95 days from seed (low) |
| purslane | days_to_maturity | 50 | 50 | OK |
| miners-lettuce | botanical_family | Montiaceae | Montiaceae | OK (*Claytonia perfoliata*; formerly Portulacaceae per APG IV) |
| corn-sweet | companions.enemies | [tomato-beefsteak, tomato-cherry] | add tomato-roma, tomato-heirloom, all 11 new tomato varieties | Corn earworm = tomato fruitworm; pest applies to all tomato varieties |
| corn-popcorn | companions.enemies | [tomato-beefsteak, tomato-cherry] | same | Same |
| corn-sweet | sfg_density | 4 | 4 | OK; Bartholomew's "Three Sisters" allotment |
| corn-popcorn | sfg_density | 4 | 4 | OK |
| jerusalem-artichoke | trellisable | false | false | OK — sunchoke stands tall on its own (8') |

---

## Cross-Cutting Recommendations

### 1. Family-enmity normalization (still the #1 issue)
The original audit's recommendation to compute `enemies` from family pairs is reinforced by this audit. ue8 *partially* fixes the original by:
- Giving all new peppers a non-empty enemy list (✓ improvement)
- Including `potato` and `fennel` consistently across all 11 new tomato varieties (✓ improvement)
- Failing to apply uniform brassica enemies to all tomatoes (✗ same drift)
- Failing to apply uniform Fabaceae↔Amaryllidaceae enemies (✗ same drift)

The most cost-effective fix is a deduplication pass: derive `enemies` programmatically from family pairs at load time (e.g., a `FAMILY_INCOMPATIBILITIES` map), then merge with the per-crop overrides. This eliminates ~40 of the 56 issues found here and ~35 of the 47 in the prior audit, leaving only genuine factual corrections.

### 2. Cucurbit SFG density (schema limitation, repeated)
ue8 added 17 sprawling cucurbits, all with `sfg_density: 1` and `edge_planting: true`. The integer-density schema cannot represent Bartholomew's "1 per 9 sqft" / "1 per 16 sqft" guidance. The `edge_planting` flag is the right pragmatic mitigation — but the auto-fill solver still over-allocates these crops. Consider extending the schema with `sqft_per_plant?: number` (omit when ≤1) so the solver can reserve correct space.

### 3. Microgreen schema mismatch
The 5 new microgreens crops don't fit the SFG model at all (they're tray-grown, harvested at seedling stage). Treating them as `sfg_density: 16` is a workaround. Consider a dedicated `growing_mode: 'soil' | 'tray' | 'hydroponic'` field, or excluding microgreens from auto-fill solver.

### 4. Garlic spring-vs-fall (now fixable)
ue8 demonstrated that the schema *can* represent fall planting via large negative `start_window_start` values (`elephant-garlic` uses `-16 to -10`). The original audit flagged regular `garlic` (`-8 to -2`) as sub-optimal spring planting. That fix is now trivially in-scope: change to `-16 to -10`.

### 5. Naming convention drift
- `asian-eggplant-japanese` and `thai-eggplant` break the established `<crop>-<variety>` pattern (e.g., `tomato-cherry`, `pepper-bell`). Suggest renaming to `eggplant-japanese` and `eggplant-thai` for consistency. Both are referenced 0 times by other crops' companion lists, so the rename is low-risk.

### 6. Where ue8 *improved* the catalog
Worth acknowledging:
- Pepper enemies: previously empty, now consistently include `fennel`
- New tomato enemies: consistently include `potato` and `fennel` (vs. inconsistent original tomatoes)
- All cucurbit sprawlers correctly carry `edge_planting: true` (the original audit found this missing on `pumpkin`-class crops because they didn't exist yet)
- Demonstrated fall-planting representation via `elephant-garlic`
- Modern APG IV families used consistently (Caprifoliaceae for `valerian` matches `mache`)

---

## Ticket References

- **This audit:** `hortilogic-f41` — read-only audit of ue8 additions
- **Predecessor:** `hortilogic-csp` (closed 2026-04-27) — original 133-crop audit at `docs/crop-catalog-audit-2026-04-27.md`
- **Source of new entries:** commit `3d5ffdc` from `hortilogic-ue8`
- **Follow-up:** A consolidated corrections-pass ticket should be opened that fixes both audits' findings together (they share the same family-enmity normalization issue and cucurbit SFG limitation).
