# Project Overview

## Vision
HortiLogic is a desktop-first, "Parametric Garden Planner" that generates optimal planting schedules based on environmental anchors (Frost Dates) rather than hard-coded calendar months. It uses "Square Foot Gardening" (SFG) principles to optimize yield in small raised beds.

## Core Philosophy
1. **Universal Logic:** Planting dates are relative integers (e.g., "-4 weeks from Last Frost"), not absolute dates.
2. **Constraint-Based:** Crop placement is governed by spatial rules (spacing, height) and biological rules (companions, rotation).
3. **Local-First:** All data lives in the browser (LocalStorage); no external backend.

## Goals (MVP)
- [ ] **The Grid:** A 4'x8' interactive UI representing 32 SFG cells.
- [ ] **The Engine:** A date-calculation utility that converts "Weeks from Frost" into "Calendar Dates" based on user settings.
- [ ] **The "Automagic" Solver:** A function that suggests the best crop for an empty square based on the current season.
- [ ] **Data Schema:** Strict TypeScript interfaces for `Crop` (with relative scheduling) and `GardenProfile`.

## Non-Goals
- Mobile Native App (this is a desktop productivity tool).
- Social Features (sharing gardens, likes).
- Complex Backend (Supabase/Firebase).
- Generic "Plant Care Reminders" (watering notifications are out of scope for MVP).

## Tech Stack
- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Explicit)
- **State:** React Context + LocalStorage
- **Icons:** Lucide-React
