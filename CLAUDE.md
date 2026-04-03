# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A curated collection of `DESIGN.md` files extracted from popular websites. Each entry captures a site's complete visual language so AI agents can generate UI that matches that design language.

**DESIGN.md** is a concept from [Google Stitch](https://stitch.withgoogle.com/docs/design-md/overview/) — a plain-text design system document that AI agents read to produce consistent UI.

## Repository Structure

Each site lives under `design-md/<site-name>/` and contains exactly three files:

| File | Purpose |
|------|---------|
| `DESIGN.md` | The design system — 9 standardized sections (see below) |
| `preview.html` | Visual token catalog (light mode) |
| `preview-dark.html` | Visual token catalog (dark mode) |

## DESIGN.md Format

Every `DESIGN.md` follows this 9-section structure per the [Stitch format](https://stitch.withgoogle.com/docs/design-md/format/):

1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings (buttons, cards, inputs, nav)
5. Layout Principles (spacing scale, grid)
6. Depth & Elevation (shadow system)
7. Do's and Don'ts
8. Responsive Behavior (breakpoints, touch targets)
9. Agent Prompt Guide (quick color reference + ready-to-use prompts)

## Contributing

- **Improve existing files**: Fix wrong hex values, inaccurate tokens, or weak descriptions by comparing against the live site. Update `preview.html` and `preview-dark.html` if displayed tokens change.
- **Request a new site**: Open a GitHub issue using the `design-md-request.yml` template with the site URL.
- New entries must follow the same 3-file structure and 9-section `DESIGN.md` format.

## README Maintenance

The root `README.md` contains a manually maintained collection list grouped by category (AI & ML, Developer Tools, Infrastructure, Design & Productivity, Fintech & Crypto, Enterprise & Consumer). When adding a new site, add it to the appropriate category in the collection list and update the badge count (`DESIGN.md count`).
