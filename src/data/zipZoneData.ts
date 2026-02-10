/**
 * ZIP3 prefix → USDA Hardiness Zone mapping using ranges
 * Each entry maps a range of ZIP3 prefixes to a zone.
 * Data is approximate (ZIP3 granularity) and based on USDA Plant Hardiness Zone Map.
 */

export interface ZipZoneRange {
  /** Start of ZIP3 range (inclusive) */
  start: number
  /** End of ZIP3 range (inclusive) */
  end: number
  /** USDA Hardiness Zone (e.g., "5b", "10a") */
  zone: string
}

/**
 * Average frost dates by USDA zone.
 * lastFrost = average last spring frost (MM-DD)
 * firstFrost = average first fall frost (MM-DD)
 */
export const ZONE_FROST_DATES: Record<string, {
  lastFrost: string
  firstFrost: string
}> = {
  '1a': { lastFrost: '06-15', firstFrost: '08-15' },
  '1b': { lastFrost: '06-10', firstFrost: '08-20' },
  '2a': { lastFrost: '06-01', firstFrost: '08-31' },
  '2b': { lastFrost: '05-25', firstFrost: '09-05' },
  '3a': { lastFrost: '05-15', firstFrost: '09-15' },
  '3b': { lastFrost: '05-10', firstFrost: '09-20' },
  '4a': { lastFrost: '05-01', firstFrost: '10-01' },
  '4b': { lastFrost: '04-25', firstFrost: '10-05' },
  '5a': { lastFrost: '04-15', firstFrost: '10-15' },
  '5b': { lastFrost: '04-10', firstFrost: '10-20' },
  '6a': { lastFrost: '04-01', firstFrost: '10-31' },
  '6b': { lastFrost: '03-25', firstFrost: '11-05' },
  '7a': { lastFrost: '03-15', firstFrost: '11-15' },
  '7b': { lastFrost: '03-10', firstFrost: '11-20' },
  '8a': { lastFrost: '03-01', firstFrost: '11-28' },
  '8b': { lastFrost: '02-20', firstFrost: '12-05' },
  '9a': { lastFrost: '02-10', firstFrost: '12-15' },
  '9b': { lastFrost: '02-01', firstFrost: '12-20' },
  '10a': { lastFrost: '01-25', firstFrost: '12-25' },
  '10b': { lastFrost: '01-15', firstFrost: '12-31' },
  '11a': { lastFrost: '01-01', firstFrost: '12-31' },
  '11b': { lastFrost: '01-01', firstFrost: '12-31' },
  '12a': { lastFrost: '01-01', firstFrost: '12-31' },
  '12b': { lastFrost: '01-01', firstFrost: '12-31' },
  '13a': { lastFrost: '01-01', firstFrost: '12-31' },
  '13b': { lastFrost: '01-01', firstFrost: '12-31' },
}

/**
 * ZIP3 prefix ranges mapped to USDA zones.
 * Organized by US postal region. Sorted by start value.
 *
 * Sources: USDA Plant Hardiness Zone Map, NOAA climate normals
 * Granularity: ZIP3 prefix (first 3 digits)
 */
export const ZIP3_ZONE_RANGES: ZipZoneRange[] = [
  // === Puerto Rico & US Virgin Islands (006-009) ===
  { start: 6, end: 9, zone: '13a' },

  // === New England (010-069) ===
  // Massachusetts
  { start: 10, end: 12, zone: '6b' },
  { start: 13, end: 13, zone: '5b' },
  { start: 14, end: 16, zone: '5b' },
  { start: 17, end: 19, zone: '6a' },
  { start: 20, end: 21, zone: '6b' },
  { start: 22, end: 24, zone: '6a' },
  { start: 25, end: 27, zone: '6b' },
  // Rhode Island
  { start: 28, end: 29, zone: '6b' },
  // New Hampshire
  { start: 30, end: 31, zone: '5a' },
  { start: 32, end: 34, zone: '5b' },
  { start: 35, end: 36, zone: '4b' },
  { start: 37, end: 38, zone: '5a' },
  // Maine
  { start: 39, end: 39, zone: '4b' },
  { start: 40, end: 41, zone: '5a' },
  { start: 42, end: 43, zone: '5b' },
  { start: 44, end: 45, zone: '4b' },
  { start: 46, end: 47, zone: '4a' },
  { start: 48, end: 49, zone: '5a' },
  // Vermont
  { start: 50, end: 51, zone: '4b' },
  { start: 52, end: 54, zone: '4a' },
  { start: 55, end: 56, zone: '4b' },
  { start: 57, end: 59, zone: '4a' },
  // Connecticut
  { start: 60, end: 61, zone: '6b' },
  { start: 62, end: 63, zone: '6a' },
  { start: 64, end: 66, zone: '6b' },
  { start: 67, end: 69, zone: '6a' },

  // === New York / New Jersey / Pennsylvania (070-199) ===
  // New Jersey
  { start: 70, end: 73, zone: '7a' },
  { start: 74, end: 76, zone: '6b' },
  { start: 77, end: 79, zone: '6b' },
  { start: 80, end: 83, zone: '7a' },
  { start: 84, end: 86, zone: '6b' },
  { start: 87, end: 89, zone: '6a' },
  // New York
  { start: 100, end: 104, zone: '7b' },
  { start: 105, end: 109, zone: '6b' },
  { start: 110, end: 119, zone: '7a' },
  { start: 120, end: 124, zone: '5b' },
  { start: 125, end: 129, zone: '5a' },
  { start: 130, end: 134, zone: '5b' },
  { start: 135, end: 139, zone: '5b' },
  { start: 140, end: 144, zone: '6a' },
  { start: 145, end: 149, zone: '5b' },
  // Pennsylvania
  { start: 150, end: 154, zone: '6b' },
  { start: 155, end: 159, zone: '6a' },
  { start: 160, end: 164, zone: '6a' },
  { start: 165, end: 169, zone: '5b' },
  { start: 170, end: 174, zone: '6b' },
  { start: 175, end: 179, zone: '6b' },
  { start: 180, end: 184, zone: '6b' },
  { start: 185, end: 189, zone: '6a' },
  { start: 190, end: 196, zone: '7a' },

  // === DC / MD / VA / WV / NC / SC (200-299) ===
  // DC / Maryland
  { start: 200, end: 205, zone: '7a' },
  { start: 206, end: 209, zone: '7a' },
  { start: 210, end: 212, zone: '7a' },
  { start: 213, end: 215, zone: '7a' },
  { start: 216, end: 219, zone: '6b' },
  // Virginia
  { start: 220, end: 223, zone: '7a' },
  { start: 224, end: 229, zone: '7a' },
  { start: 230, end: 232, zone: '7b' },
  { start: 233, end: 237, zone: '8a' },
  { start: 238, end: 239, zone: '7a' },
  { start: 240, end: 243, zone: '6b' },
  { start: 244, end: 246, zone: '6a' },
  // West Virginia
  { start: 247, end: 249, zone: '6a' },
  { start: 250, end: 253, zone: '6b' },
  { start: 254, end: 259, zone: '6a' },
  { start: 260, end: 262, zone: '6b' },
  { start: 263, end: 268, zone: '6a' },
  // North Carolina
  { start: 269, end: 272, zone: '7b' },
  { start: 273, end: 274, zone: '7a' },
  { start: 275, end: 279, zone: '7b' },
  { start: 280, end: 282, zone: '8a' },
  { start: 283, end: 285, zone: '7b' },
  { start: 286, end: 289, zone: '7a' },
  // South Carolina
  { start: 290, end: 292, zone: '8a' },
  { start: 293, end: 295, zone: '8b' },
  { start: 296, end: 299, zone: '8a' },

  // === Georgia / Florida / Alabama / Tennessee / Mississippi (300-399) ===
  // Georgia
  { start: 300, end: 303, zone: '7b' },
  { start: 304, end: 305, zone: '8a' },
  { start: 306, end: 309, zone: '8a' },
  { start: 310, end: 312, zone: '8b' },
  { start: 313, end: 316, zone: '8a' },
  { start: 317, end: 319, zone: '9a' },
  // Florida
  { start: 320, end: 322, zone: '9a' },
  { start: 323, end: 325, zone: '9b' },
  { start: 326, end: 329, zone: '9a' },
  { start: 330, end: 332, zone: '10b' },
  { start: 333, end: 336, zone: '10a' },
  { start: 337, end: 339, zone: '9b' },
  { start: 340, end: 342, zone: '9a' },
  { start: 343, end: 344, zone: '9b' },
  { start: 346, end: 347, zone: '9b' },
  { start: 349, end: 349, zone: '10a' },
  // Alabama
  { start: 350, end: 352, zone: '7b' },
  { start: 353, end: 355, zone: '8a' },
  { start: 356, end: 359, zone: '7b' },
  { start: 360, end: 362, zone: '8a' },
  { start: 363, end: 364, zone: '8b' },
  { start: 365, end: 366, zone: '8a' },
  { start: 367, end: 369, zone: '7b' },
  // Tennessee
  { start: 370, end: 373, zone: '7a' },
  { start: 374, end: 376, zone: '7a' },
  { start: 377, end: 379, zone: '7a' },
  { start: 380, end: 381, zone: '7b' },
  { start: 382, end: 385, zone: '7a' },
  // Mississippi
  { start: 386, end: 389, zone: '8a' },
  { start: 390, end: 392, zone: '8a' },
  { start: 393, end: 395, zone: '8b' },
  { start: 396, end: 397, zone: '8a' },

  // === Kentucky / Ohio / Indiana / Michigan (400-499) ===
  // Kentucky
  { start: 400, end: 402, zone: '6b' },
  { start: 403, end: 405, zone: '6b' },
  { start: 406, end: 409, zone: '6b' },
  { start: 410, end: 412, zone: '6b' },
  { start: 413, end: 416, zone: '6b' },
  { start: 417, end: 418, zone: '6b' },
  { start: 419, end: 422, zone: '6a' },
  { start: 423, end: 427, zone: '7a' },
  // Ohio
  { start: 430, end: 432, zone: '6a' },
  { start: 433, end: 436, zone: '6a' },
  { start: 437, end: 439, zone: '5b' },
  { start: 440, end: 442, zone: '6a' },
  { start: 443, end: 445, zone: '6a' },
  { start: 446, end: 449, zone: '5b' },
  { start: 450, end: 452, zone: '6a' },
  { start: 453, end: 455, zone: '6a' },
  { start: 456, end: 458, zone: '6a' },
  { start: 459, end: 459, zone: '5b' },
  // Indiana
  { start: 460, end: 462, zone: '6a' },
  { start: 463, end: 466, zone: '5b' },
  { start: 467, end: 469, zone: '6a' },
  { start: 470, end: 472, zone: '6b' },
  { start: 473, end: 475, zone: '6a' },
  { start: 476, end: 479, zone: '5b' },
  // Michigan
  { start: 480, end: 482, zone: '6a' },
  { start: 483, end: 485, zone: '6a' },
  { start: 486, end: 489, zone: '5b' },
  { start: 490, end: 492, zone: '5b' },
  { start: 493, end: 496, zone: '5a' },
  { start: 497, end: 499, zone: '4b' },

  // === Iowa / Wisconsin / Minnesota / SD / ND / Montana (500-599) ===
  // Iowa
  { start: 500, end: 503, zone: '5b' },
  { start: 504, end: 509, zone: '5a' },
  { start: 510, end: 514, zone: '5a' },
  { start: 515, end: 519, zone: '5a' },
  { start: 520, end: 524, zone: '5a' },
  { start: 525, end: 528, zone: '4b' },
  // Wisconsin
  { start: 530, end: 532, zone: '5a' },
  { start: 533, end: 535, zone: '5a' },
  { start: 536, end: 539, zone: '4b' },
  { start: 540, end: 544, zone: '4a' },
  { start: 545, end: 549, zone: '4b' },
  // Minnesota
  { start: 550, end: 553, zone: '4a' },
  { start: 554, end: 556, zone: '4a' },
  { start: 557, end: 559, zone: '4b' },
  { start: 560, end: 562, zone: '4a' },
  { start: 563, end: 564, zone: '4b' },
  { start: 565, end: 567, zone: '3b' },
  // South Dakota
  { start: 570, end: 572, zone: '4b' },
  { start: 573, end: 574, zone: '4a' },
  { start: 575, end: 577, zone: '4a' },
  // North Dakota
  { start: 580, end: 582, zone: '4a' },
  { start: 583, end: 585, zone: '3b' },
  { start: 586, end: 588, zone: '3b' },
  // Montana
  { start: 590, end: 592, zone: '4b' },
  { start: 593, end: 595, zone: '4a' },
  { start: 596, end: 599, zone: '4a' },

  // === Illinois / Missouri / Kansas / Nebraska (600-699) ===
  // Illinois
  { start: 600, end: 602, zone: '6a' },
  { start: 603, end: 605, zone: '5b' },
  { start: 606, end: 609, zone: '6a' },
  { start: 610, end: 612, zone: '5b' },
  { start: 613, end: 616, zone: '5b' },
  { start: 617, end: 619, zone: '6a' },
  { start: 620, end: 622, zone: '6a' },
  { start: 623, end: 625, zone: '6b' },
  { start: 626, end: 629, zone: '6a' },
  // Missouri
  { start: 630, end: 632, zone: '6b' },
  { start: 633, end: 635, zone: '6a' },
  { start: 636, end: 639, zone: '6b' },
  { start: 640, end: 642, zone: '6a' },
  { start: 643, end: 646, zone: '6a' },
  { start: 647, end: 649, zone: '6b' },
  { start: 650, end: 652, zone: '6b' },
  { start: 653, end: 655, zone: '7a' },
  { start: 656, end: 658, zone: '6b' },
  // Kansas
  { start: 660, end: 662, zone: '6a' },
  { start: 663, end: 666, zone: '6a' },
  { start: 667, end: 669, zone: '6b' },
  { start: 670, end: 672, zone: '6b' },
  { start: 673, end: 676, zone: '6a' },
  { start: 677, end: 679, zone: '5b' },
  // Nebraska
  { start: 680, end: 682, zone: '5b' },
  { start: 683, end: 685, zone: '5a' },
  { start: 686, end: 689, zone: '5a' },
  { start: 690, end: 693, zone: '4b' },

  // === Louisiana / Arkansas / Oklahoma / Texas (700-799) ===
  // Louisiana
  { start: 700, end: 701, zone: '9a' },
  { start: 703, end: 705, zone: '9a' },
  { start: 706, end: 708, zone: '8b' },
  { start: 710, end: 714, zone: '8b' },
  // Arkansas
  { start: 716, end: 718, zone: '7b' },
  { start: 719, end: 722, zone: '7b' },
  { start: 723, end: 725, zone: '7a' },
  { start: 726, end: 729, zone: '7b' },
  // Oklahoma
  { start: 730, end: 731, zone: '7b' },
  { start: 733, end: 735, zone: '7a' },
  { start: 736, end: 738, zone: '7a' },
  { start: 739, end: 741, zone: '7a' },
  { start: 743, end: 745, zone: '7a' },
  { start: 746, end: 749, zone: '6b' },
  // Texas
  { start: 750, end: 753, zone: '8a' },
  { start: 754, end: 756, zone: '8a' },
  { start: 757, end: 759, zone: '8a' },
  { start: 760, end: 762, zone: '8a' },
  { start: 763, end: 765, zone: '7b' },
  { start: 766, end: 769, zone: '8a' },
  { start: 770, end: 772, zone: '9a' },
  { start: 773, end: 775, zone: '9a' },
  { start: 776, end: 778, zone: '9a' },
  { start: 779, end: 782, zone: '9b' },
  { start: 783, end: 785, zone: '9a' },
  { start: 786, end: 789, zone: '8b' },
  { start: 790, end: 793, zone: '7b' },
  { start: 794, end: 796, zone: '7a' },
  { start: 797, end: 799, zone: '8a' },

  // === Colorado / Wyoming / Idaho / Utah / Arizona / NM / Nevada (800-899) ===
  // Colorado
  { start: 800, end: 803, zone: '5b' },
  { start: 804, end: 806, zone: '5b' },
  { start: 807, end: 809, zone: '5a' },
  { start: 810, end: 812, zone: '5a' },
  { start: 813, end: 816, zone: '4b' },
  // Wyoming
  { start: 820, end: 822, zone: '5a' },
  { start: 823, end: 826, zone: '4b' },
  { start: 827, end: 831, zone: '4a' },
  // Idaho
  { start: 832, end: 833, zone: '6b' },
  { start: 834, end: 836, zone: '5b' },
  { start: 837, end: 838, zone: '5a' },
  // Utah
  { start: 840, end: 841, zone: '7a' },
  { start: 842, end: 843, zone: '6a' },
  { start: 844, end: 845, zone: '5b' },
  { start: 846, end: 847, zone: '5a' },
  // Arizona
  { start: 850, end: 852, zone: '9b' },
  { start: 853, end: 855, zone: '9a' },
  { start: 856, end: 857, zone: '8b' },
  { start: 859, end: 860, zone: '7a' },
  { start: 863, end: 864, zone: '5a' },
  { start: 865, end: 865, zone: '9a' },
  // New Mexico
  { start: 870, end: 872, zone: '7a' },
  { start: 873, end: 874, zone: '6a' },
  { start: 875, end: 877, zone: '7a' },
  { start: 878, end: 879, zone: '6b' },
  { start: 880, end: 882, zone: '8a' },
  { start: 883, end: 884, zone: '6a' },
  // Nevada
  { start: 889, end: 891, zone: '9a' },
  { start: 893, end: 895, zone: '6b' },
  { start: 897, end: 898, zone: '5b' },

  // === California / Oregon / Washington / Alaska / Hawaii (900-999) ===
  // California - Southern
  { start: 900, end: 904, zone: '10a' },
  { start: 905, end: 908, zone: '10b' },
  { start: 910, end: 912, zone: '10a' },
  { start: 913, end: 916, zone: '9b' },
  { start: 917, end: 918, zone: '10a' },
  { start: 919, end: 921, zone: '10b' },
  { start: 922, end: 925, zone: '9a' },
  { start: 926, end: 928, zone: '10a' },
  // California - Central
  { start: 930, end: 932, zone: '9b' },
  { start: 933, end: 935, zone: '9a' },
  { start: 936, end: 938, zone: '9b' },
  { start: 939, end: 941, zone: '10a' },
  // California - Northern / Bay Area
  { start: 942, end: 944, zone: '10a' },
  { start: 945, end: 948, zone: '9b' },
  { start: 949, end: 951, zone: '9b' },
  { start: 952, end: 954, zone: '9a' },
  { start: 955, end: 958, zone: '9a' },
  { start: 959, end: 961, zone: '8b' },
  // Hawaii
  { start: 967, end: 968, zone: '12a' },
  // Oregon
  { start: 970, end: 972, zone: '8b' },
  { start: 973, end: 975, zone: '8a' },
  { start: 976, end: 977, zone: '6b' },
  { start: 978, end: 979, zone: '6a' },
  // Washington
  { start: 980, end: 982, zone: '8b' },
  { start: 983, end: 984, zone: '8a' },
  { start: 985, end: 986, zone: '6b' },
  { start: 988, end: 989, zone: '6a' },
  { start: 990, end: 992, zone: '6b' },
  { start: 993, end: 994, zone: '5b' },
  // Alaska
  { start: 995, end: 996, zone: '4b' },
  { start: 997, end: 998, zone: '3b' },
  { start: 999, end: 999, zone: '2a' },
]
