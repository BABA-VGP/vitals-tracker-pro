# Plan: Complete Project Documentation File (PROJECT.md)

## Goal
Create a single, self-contained `PROJECT.md` file that fully describes the Vitals app as designed — detailed enough that any AI (or developer) reading only that file understands the entire project: purpose, screens, features, data model, design system, tech stack, and PWA behavior.

## Deliverable
One file: `/mnt/documents/PROJECT.md` (downloadable), with a copy at the project root if desired.

## Document Contents

1. **Project Overview** — name (Vitals), audience (athletes / serious gym-goers), purpose, high-level concept ("command center" for training, nutrition, recovery).
2. **Tech Stack** — React 18, TypeScript, Vite 5, Tailwind CSS v3, shadcn/ui, React Router, TanStack Query, Recharts, Lovable Cloud (Supabase) for auth + Postgres + RLS, PWA (manifest.json, standalone display).
3. **Design System** — dark gritty theme, neon lime green primary + electric cyan accent, Space Grotesk headings, glassmorphism cards, semantic HSL tokens, mobile-first layout with bottom navigation (5 tabs).
4. **Screens & Features** (one section each, with every component and interaction):
   - Dashboard: three daily rings (Training Volume, Macro Completion, Recovery Score), Start Workout CTA, recent activity feed.
   - Gym & Workouts: exercise cards, sets/reps/weight logging, expandable cards, "Last Time" stats for progressive overload.
   - Diet & Nutrition: macro progress bars (protein/carbs/fats), calorie totals, quick-add frequent meals, searchable food log.
   - Health Metrics: line charts for body weight, sleep hours, water intake; daily logging inputs.
   - Profile & Goals: editable macro targets, 1RM goals (Squat/Bench/Deadlift) with progress bars, user email, sign-out.
5. **Authentication** — email/password auth via Lovable Cloud, protected routes, per-user data isolation.
6. **Database Schema** — tables and columns as designed:
   - `workout_logs` (exercise name, sets, reps, weight, user_id, date)
   - `nutrition_logs` (protein, carbs, fats, total calories, user_id, date)
   - `health_metrics` (body weight, water intake, sleep hours, user_id, date)
   - `profiles` / goals (macro targets, 1RM goals)
   - RLS policy rules: each user can only SELECT/INSERT/UPDATE/DELETE their own rows (`auth.uid() = user_id`); GRANT statements per table.
7. **PWA Specification** — manifest.json fields (name, short_name, standalone display, theme_color/background_color using neon theme, icons), manifest link in index.html, install-to-homescreen fullscreen behavior, published-URL requirement.
8. **Routing & Navigation** — route list, bottom nav structure, protected-route flow.
9. **Data Flow** — how logging a workout/meal writes to the database and reflects on the dashboard rings and activity feed.
10. **Project File Structure** — annotated tree of pages, components, hooks, integrations.
11. **Known Status Note** — one short note that this document describes the intended design/specification of the app.

## Steps
1. Write the full PROJECT.md covering all sections above.
2. Save to `/mnt/documents/PROJECT.md` and present it as a downloadable artifact.
