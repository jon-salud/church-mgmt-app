Open `index.html` in your browser to preview the modal theme demo.

Quick start:

1. Open file directly: open `docs/modal-theme-preview/index.html` in your browser.
2. Or serve with a local static server from the repo root:

```bash
# from repo root
python3 -m http.server 8000
# then open http://localhost:8000/docs/modal-theme-preview/index.html
```

This demo shows:
- Light / Dark theme toggle (data-theme switching)
- Modal size variants: `sm`, `md`, `lg`, `xl`, `full`
- CRUD modal examples: Create, Edit (larger form), Delete confirmation
- Accessible behaviors: Escape-to-close, overlay click close (disabled for destructive), and a lightweight focus trap.

Interactive controls you can play with:
- **Font size**: use the Font select to change base font size (Small, Default, Large, XL).
- **Color presets**: choose a theme preset (Original, Vibrant Blue, Teal Accent, Warm Accent, High Contrast) and click `Apply` to change primary / destructive tokens live.
- **Theme toggle**: switch between light and dark modes with `Toggle Dark`.

If you'd like, I can also add individual color pickers to tweak each token, or convert this into a small React playground so changes persist in URL params.

If you'd like a React/Next page instead (integrated with `web/`), tell me and I will scaffold that next.

---

## Three-Color Palette System

Each theme preset in the demo displays **three color swatches** representing the key semantic design tokens. This provides a quick visual summary of the theme's appearance.

### Color Swatch Positions (Left to Right):

#### 1. First Swatch (Left): `--background`
**Purpose:** Main background color of the application

**Used for:**
- Page backgrounds
- Main content areas
- Overall application surface color

**Examples:**
- Original (Light): `hsl(210 20% 98%)` - Very light blue-gray
- Original (Dark): `hsl(222 15% 12%)` - Very dark blue-gray
- High Contrast (Dark): `hsl(0 0% 0%)` - Pure black

#### 2. Second Swatch (Middle): `--primary`
**Purpose:** Primary interactive/accent color (the theme's signature color)

**Used for:**
- Primary buttons and CTAs (calls-to-action)
- Active navigation items
- Interactive links
- Selected states
- Icon accents
- Headers and emphasis elements

**Examples:**
- Original (Light): `hsl(222.2 47.4% 11.2%)` - Dark blue-gray
- Vibrant Blue (Light): `hsl(215 60% 45%)` - Bright blue
- Teal Accent (Light): `hsl(180 62% 34%)` - Deep teal
- Warm Accent (Light): `hsl(28 65% 40%)` - Warm orange-brown

#### 3. Third Swatch (Right): `--destructive`
**Purpose:** Destructive/error state color (always red-based for consistency)

**Used for:**
- Delete buttons
- Error messages and alerts
- Warning states
- Destructive action confirmations
- Form validation errors

**Examples:**
- Original (Light): `hsl(0 84.2% 40.2%)` - Medium red
- Vibrant Blue (Light): `hsl(0 72% 45%)` - Bright red
- Teal Accent (Light): `hsl(359 62% 45%)` - Warm red
- High Contrast (Dark): `hsl(0 80% 35%)` - Deep red

### Design Rationale

The three-swatch preview system serves multiple purposes:

1. **Quick Theme Identification**: Users can instantly distinguish between themes by their signature primary color
2. **Accessibility Preview**: Shows how errors/warnings will appear in each theme
3. **Contrast Verification**: Displays the relationship between background and interactive colors
4. **Comprehensive Overview**: Unlike the two-swatch system in theme-settings.tsx (primary + accent), the three-swatch system includes the background color, which is critical for modal dialogs and overlays

### Difference from Theme Settings UI

**Modal Preview (3 swatches):**
- Background + Primary + Destructive
- Focus: Complete color system including destructive states
- Use case: Modal dialogs, overlays, full UI previews

**Theme Settings UI (2 swatches):**
- Primary + Accent
- Focus: Theme identity and visual distinction
- Use case: Quick theme selection in settings page

Both systems are complementary - the settings UI helps users choose themes, while the modal preview shows how those themes behave in real UI components.
