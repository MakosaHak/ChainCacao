# Design System: Digital Terroir & The Editorial Ledger

## 1. Overview & Creative North Star: "The Digital Curator"
This design system moves away from the "commodity" look of standard blockchain or agricultural tech. We are building for **ChainCacao**, where the "Digital Terroir" aesthetic blends the raw, tactile nature of the cacao bean with the precision of high-end ledger technology.

**The Creative North Star: The Digital Curator.** 
The UI should feel like a premium, high-end editorial journal. We achieve this through "Organic Brutalism"—using bold, asymmetrical layouts and expansive white space (breathing room) balanced by refined, sophisticated tonal layering. We are not just building a website; we are curating a digital provenance.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
Our palette is rooted in the earth but polished for the elite. We avoid the clinical coldness of tech by using warm, parchment-based neutrals and deep, forest-infused greens.

### Color Tokens
*   **Primary (Vert Cacao):** `#154212` (Main brand power) / `#2D5A27` (Container logic)
*   **Secondary (Deep Brown):** `#755750` / `#4E342E` (Grounding elements)
*   **Tertiary (Or Premium):** `#D4AF37` / `#735c00` (The "Golden Thread" of trust)
*   **Background (Blanc Cassé):** `#fbfbe2` (The canvas)

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through background color shifts. To separate the Hero from the Features section, shift the background from `surface` to `surface-container-low`. Structure is created by mass and tone, not by "outlining" boxes.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, handmade paper. 
*   **Level 0 (Base):** `surface` (`#fbfbe2`)
*   **Level 1 (Sections):** `surface-container-low` (`#f5f5dc`)
*   **Level 2 (Cards/Focus):** `surface-container` (`#efefd7`)
*   **Level 3 (Interactive/Floating):** `surface-container-highest` (`#e4e4cc`)

### The "Glass & Gradient" Rule
To elevate the "Digital" aspect of the terroir, use Glassmorphism for floating navigation bars or high-level modals. Use `surface_variant` at 70% opacity with a `20px` backdrop-blur. 
**Signature Gradient:** For primary CTAs, use a subtle linear gradient from `primary` (#154212) to `primary_container` (#2d5a27) at a 135-degree angle to provide a velvet-like depth.

---

## 3. Typography: The Editorial Scale
We pair the structural authority of **Plus Jakarta Sans** (representing the headings/Montserrat request) with the legible, humanistic flow of **Work Sans** (representing the body/Open Sans request).

*   **Display (Large/Med/Small):** Plus Jakarta Sans. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero headlines. This conveys the "Scale of Impact."
*   **Headline (Large/Med/Small):** Plus Jakarta Sans. These should be used for section headers. Always pair a `headline-lg` with a `label-md` "kicker" text above it in `tertiary` (Or Premium) to establish an editorial rhythm.
*   **Body (Large/Med/Small):** Work Sans. Set `body-lg` with a generous line-height (1.6) to ensure the "Eco-friendly" feeling of space and transparency.
*   **Labels:** Work Sans. Used for data points and small captions. These should always be uppercase with +0.05em tracking to feel like a "Certified" stamp.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to create hierarchy; we use light and stacking.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "recessed" or "lifted" feel through pure color value.
*   **Ambient Shadows:** If a component *must* float (e.g., a dropdown), use a shadow color tinted with `#2B1611` (Deep Brown) at 5% opacity, with a 32px blur and 16px offset. It should look like a soft shadow on a forest floor, not a digital glow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.
*   **Asymmetry:** Avoid centered grids. Offset images and text blocks. Let a product image bleed off the edge of a `surface-container` to break the "boxed-in" feel of traditional web design.

---

## 5. Components: The Premium Toolkit

### Buttons (The "Seal")
*   **Primary:** Solid `primary` background. No border. `rounded-md` (0.375rem). High-contrast `on-primary` text.
*   **Secondary:** `surface-container-highest` background. Subtle tonal shift on hover.
*   **Tertiary:** No background. `primary` text with a 2px underline using the `tertiary` (Or Premium) color.

### Cards & Lists (The "Ledger")
*   **Rule:** Forbid divider lines. Use `1.5rem` to `2rem` of vertical white space to separate list items. 
*   **Data Visualization:** Use `tertiary_container` for progress bars or data points to highlight the "Value" of the cacao.

### Input Fields
*   **Style:** Minimalist. Background should be `surface_bright` with a bottom-only border using `outline_variant`. On focus, the bottom border transforms into a 2px `primary` line.

### Additional Component: "The Provenance Chip"
*   A custom chip variant using `secondary_container` background with `on_secondary_container` text. Use these to tag "Origin," "Batch Number," or "Sustainability Score." They should feel like small, high-quality physical labels.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use "Breathing Room." If you think there is enough margin, double it.
*   **Do** use high-quality, macro photography of cacao textures paired with clean, technical data overlays.
*   **Do** use `tertiary` (Gold) sparingly—only for "Trust" elements like certifications or primary CTAs.

### Don't:
*   **Don't** use 100% black. Use `on_surface` (#1b1d0e) or `secondary` (#755750) for text to maintain the organic warmth.
*   **Don't** use standard 4-column grids for everything. Try a 3-column layout where one column is intentionally left empty to create editorial tension.
*   **Don't** use sharp `0px` corners or perfectly round `full` corners for primary containers. Stick to the `md` (0.375rem) scale for a balanced, professional feel.