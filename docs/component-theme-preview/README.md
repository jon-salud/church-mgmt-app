# Component Theme Preview

A comprehensive, interactive design system showcase for the Church Management App. Preview all UI components with live theme switching and accessibility testing.

## Quick Start

**Option 1: Direct Open**
```bash
open docs/component-theme-preview/index.html
```

**Option 2: Local Server** (recommended for full functionality)
```bash
# From repo root
python3 -m http.server 8000
# Then open http://localhost:8000/docs/component-theme-preview/index.html
```

## What's Included

### 🎨 Theme System
- **Light Theme Presets**: Original, Vibrant Blue, Teal Accent, Warm Accent
- **Dark Theme Presets**: Original (Dark), Vibrant Blue (Dark), Teal Accent (Dark), Warm Accent (Dark), High Contrast
- **Live Theme Switching**: See instant updates across all components
- **Font Size Control**: Test accessibility with Small (14px), Default (16px), Large (18px), XL (20px)

### 🧩 Components Showcase

#### Buttons (5 Variants)
- Primary, Outline, Secondary, Ghost, Destructive
- Disabled states
- Full theme integration

#### Form Elements
- Text inputs with labels
- Textareas
- Select dropdowns
- Checkboxes
- Focus states and validation

#### Card Layouts
- Responsive grid patterns
- Nested card styles
- Box shadows and borders

#### Data Tables
- Header and body rows
- Hover states
- Sortable columns

#### Progress Indicators
- Loading spinners
- Progress bars with percentages

#### Modals (Size Variants)
- **Small (sm)**: Delete confirmations, simple dialogs
- **Medium (md)**: Create forms, quick actions
- **Large (lg)**: Edit forms, detailed data
- **XL & Full**: Complex workflows (showcased in demo)
- **Accessibility**: Escape-to-close, overlay click handling, focus trapping

### ♿ Accessibility Features
- Keyboard navigation (Tab, Shift+Tab, Escape)
- Focus trapping in modals
- ARIA roles and labels
- Screen reader support
- High contrast theme option

## Usage

### Testing Themes
1. Select a preset from the Light or Dark theme sections
2. Click the three-swatch button to apply
3. Observe all components update instantly
4. Test font sizes with the dropdown control

### Testing Modals
- **Create Member (md)**: Medium-sized form modal
- **Edit Member (lg)**: Large form with grid layout
- **Delete Confirmation (sm)**: Small destructive action modal

### Component Interaction
- All form elements are interactive
- Buttons show hover states
- Table rows highlight on hover
- Cards respond to theme changes

## Three-Color Swatch System

Each theme preset shows three color swatches for quick identification:

1. **Left Swatch**: `--background` (page/card background)
2. **Middle Swatch**: `--primary` (interactive elements, CTAs, headers)
3. **Right Swatch**: `--destructive` (errors, delete actions, warnings)

This provides instant visual feedback on:
- Theme identity (signature color)
- Background-to-foreground contrast
- Error state appearance

## Design System Integration

This preview is built using the same design tokens as the main app:
- Defined in `docs/DESIGN_SYSTEM.md`
- Implemented in `web/app/globals.css`
- Used throughout `web/components/**`

Changes to the design system should be reflected here for validation before deployment.

## Development Notes

- Pure HTML/CSS/vanilla JS (no build step required)
- Self-contained demo for quick sharing
- Can be extended with more components as the design system grows
- Useful for client demos and stakeholder previews

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
