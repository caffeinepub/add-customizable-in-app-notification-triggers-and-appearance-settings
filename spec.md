# Specification

## Summary
**Goal:** Let each signed-in user configure which in-app activities trigger notifications and how notification toasts look/where they appear, with preferences persisted per Internet Identity principal.

**Planned changes:**
- Backend: extend the existing `UserProfile` stable model to include notification preferences (trigger toggles + appearance settings) and add APIs to get/update the caller’s preferences while preserving existing profile data across upgrades.
- Frontend: implement a real notifications module/hook (replacing the current placeholder) that centralizes in-app toast emission and gates notifications based on the user’s saved trigger preferences.
- Frontend: add a settings UI (in Profile or a new settings area) with per-trigger toggles plus appearance controls (at least toast position and visual style), and persist changes with success/error feedback.
- Frontend: apply the chosen appearance settings consistently to all notification toasts via composition/wrapping (no direct edits to read-only UI components).

**User-visible outcome:** Signed-in users can enable/disable specific in-app notification triggers and customize toast appearance/position; these settings persist across refresh/login and are applied to all in-app notifications while the app is open.
