# Church Management App - Design System

**Version:** 1.0.0  
**Last Updated:** 2025-11-06  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Shadow Scale](#shadow-scale)
5. [Border Radius](#border-radius)
6. [Typography](#typography)
7. [Spacing](#spacing)
8. [Component Library](#component-library)
9. [Accessibility](#accessibility)
10. [Page Patterns](#page-patterns)
11. [Migration Guide](#migration-guide)

---

## Overview

This design system defines the visual language for the Church Management App. It provides a comprehensive set of design tokens, components, and guidelines to ensure consistency across the application.

### Purpose

- **Consistency:** Single source of truth for UI decisions
- **Efficiency:** Pre-defined tokens reduce decision fatigue
- **Maintainability:** Centralized system easier to update
- **Accessibility:** WCAG 2.1 AA compliance built-in
- **Quality:** Professional, modern aesthetic

### Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 3.4
- **Component Library:** Flowbite React (wrappers in `web/components/ui-flowbite/`)
- **Design Tokens:** CSS custom properties (HSL color space)
- **Dark Mode:** System preference with manual toggle

### Key Files

- **Design Tokens:** `web/app/globals.css` (authoritative source)
- **Components:** `web/components/ui-flowbite/` (20+ components)
- **Standards:** `docs/CODING_STANDARDS.md` (usage guidelines)
- **Migration:** `docs/FLOWBITE_MIGRATION.md` (Radix UI → Flowbite)

---

## Design Philosophy

### Core Principles

1. **Modern & Clean Aesthetic**
   - Minimal visual clutter
   - Clear hierarchy through layering
   - Subtle shadows for depth
   - Generous white space

2. **CSS Variables First**
   - Always use design tokens
   - Never hardcode colors/shadows
   - Enables theme consistency
   - Simplifies theme switching

3. **Visual Depth Through Layers**
   ```
   Background → Container → Card → Content
   210 20% 98%   210 20% 96%   0 0% 100%   [content]
   ```

4. **Subtle Elevation**
   - Use shadow scale appropriately
   - Avoid heavy drop shadows
   - Elevation conveys importance

5. **Accessibility First**
   - WCAG 2.1 AA compliant
   - Visible focus states
   - Keyboard navigation support
   - Respect motion preferences

6. **Responsive Design**
   - Mobile-first approach
   - Tested at 375px, 768px, 1024px, 1440px
   - Touch targets ≥44px on mobile

---

## Color System

### Background Colors

#### Light Mode

```css
--background: 210 20% 98%;         /* Main page background - subtle blue-gray */
--background-subtle: 210 20% 96%;  /* Nested containers - slightly darker */
--card: 0 0% 100%;                 /* Pure white cards - clear separation */
--card-hover: 210 20% 99%;         /* Subtle hover state */
```

**Visual Hierarchy:**
- Background (98%) → Container (96%) → Card (100%)
- **2% lightness difference** creates subtle depth
- Card is **brighter** than background (intentional for elevation)

**Usage:**
```tsx
// Page background
<div className="bg-background">
  
  // Nested container
  <div className="bg-background-subtle">
    
    // Card content
    <Card>Content with pure white background</Card>
  </div>
</div>
```

#### Dark Mode

```css
--background: 222.2 84% 4.9%;        /* Deep background */
--background-subtle: 217.2 32.6% 17.5%;  /* Nested containers */
--card: 222.2 70% 8%;                /* Elevated cards (8% vs 4.9% bg) */
--card-hover: 222.2 70% 10%;         /* Hover state */
```

**Visual Hierarchy:**
- Background (4.9%) → Card (8%) → Card Hover (10%)
- **3.1% lightness difference** for elevation
- Cards are **lighter** than background (standard dark mode pattern)

### Semantic Colors

#### Primary

```css
/* Light Mode */
--primary: 222.2 47.4% 11.2%;           /* Dark blue */
--primary-foreground: 210 40% 98%;      /* Near white text */

/* Dark Mode */
--primary: 210 40% 98%;                 /* Light blue */
--primary-foreground: 222.2 47.4% 11.2%; /* Dark text */
```

**Usage:** Main brand color, primary buttons, links, emphasis

#### Secondary

```css
/* Light Mode */
--secondary: 210 40% 96.1%;             /* Light blue-gray */
--secondary-foreground: 222.2 47.4% 11.2%; /* Dark text */

/* Dark Mode */
--secondary: 217.2 32.6% 17.5%;         /* Medium gray */
--secondary-foreground: 210 40% 98%;     /* Light text */
```

**Usage:** Secondary buttons, alternative actions, backgrounds

#### Destructive

```css
/* Light Mode */
--destructive: 0 84.2% 40.2%;           /* Vibrant red */
--destructive-foreground: 210 40% 98%;  /* Near white text */

/* Dark Mode */
--destructive: 0 62.8% 30.6%;           /* Muted red */
--destructive-foreground: 210 40% 98%;  /* Light text */
```

**Usage:** Delete buttons, error states, warnings

#### Muted

```css
/* Light Mode */
--muted: 210 40% 96.1%;                 /* Light gray */
--muted-foreground: 215.4 16.3% 46.9%;  /* Medium gray text */

/* Dark Mode */
--muted: 217.2 32.6% 17.5%;             /* Dark gray */
--muted-foreground: 215 20.2% 65.1%;    /* Light gray text */
```

**Usage:** Disabled states, placeholder text, secondary information

### Functional Colors

```css
/* Borders */
--border: 214.3 31.8% 91.4%;     /* Light mode: subtle gray */
--border: 217.2 32.6% 17.5%;     /* Dark mode: medium gray */

/* Inputs */
--input: 214.3 31.8% 91.4%;      /* Matches border for consistency */

/* Focus Ring */
--ring: 222.2 84% 4.9%;          /* Light mode: dark blue */
--ring: 212.7 26.8% 83.9%;       /* Dark mode: light blue */
```

### Color Usage Guidelines

**DO:**
- ✅ Use semantic colors: `bg-primary`, `text-destructive`, `bg-card`
- ✅ Use design tokens: `bg-background`, `text-foreground`
- ✅ Test in both light and dark modes
- ✅ Verify contrast meets WCAG 2.1 AA (4.5:1 for text)

**DON'T:**
- ❌ Hardcode colors: `bg-white`, `bg-gray-100`, `text-black`
- ❌ Use arbitrary colors: `bg-[#f3f4f6]`
- ❌ Skip dark mode testing
- ❌ Use low-contrast color combinations

---

## Shadow Scale

### Tailwind Shadow Utilities

The design system uses **Tailwind's built-in shadow utilities**. Do NOT create custom `--shadow-*` CSS variables.

```css
/* Available Shadow Scale */
shadow-sm   /* Subtle elevation - small elements */
shadow      /* Default elevation - standard cards */
shadow-md   /* Medium elevation - interactive cards, hover states */
shadow-lg   /* Large elevation - modals, popovers */
shadow-xl   /* Extra large elevation - overlays, dialogs */
shadow-2xl  /* Maximum elevation - rarely used */
```

### Shadow Usage by Component

| Component | Default | Hover | Purpose |
|-----------|---------|-------|---------|
| **Cards** | `shadow-md` | `shadow-lg` | List items, content cards |
| **Forms** | `shadow-sm` | - | Input fields (focus uses ring) |
| **Dropdowns** | `shadow-md` | - | Menus, select options |
| **Modals** | `shadow-lg` | - | Dialogs, overlays |
| **Popovers** | `shadow-lg` | - | Tooltips, contextual info |

### Shadow Examples

```tsx
// Subtle card elevation
<Card className="shadow-sm hover:shadow-md">
  <CardContent>Standard card with subtle shadow</CardContent>
</Card>

// Input with subtle shadow
<Input className="shadow-sm focus:ring-2" />

// Modal with prominent shadow
<Dialog className="shadow-lg">
  <DialogContent>Modal with large shadow</DialogContent>
</Dialog>
```

### Dark Mode Behavior

**Tailwind automatically adjusts shadows for dark mode:**
- Light mode: Shadows use `rgba(0, 0, 0, ...)` (dark shadows)
- Dark mode: Shadows maintained but less prominent (automatic opacity adjustment)

**No custom dark mode shadow configuration needed.**

### Shadow Guidelines

**DO:**
- ✅ Use `shadow-sm` for default cards (subtle elevation)
- ✅ Use `hover:shadow-md` for interactive cards
- ✅ Use `shadow-lg` for modals and overlays
- ✅ Keep shadows subtle and professional

**DON'T:**
- ❌ Create custom `--shadow-*` CSS variables
- ❌ Use heavy shadows (`shadow-2xl` except for special cases)
- ❌ Apply shadows to every element (overuse reduces impact)
- ❌ Skip hover states on interactive cards

---

## Border Radius

### Radius Tokens

```css
--radius-sm: 0.375rem;   /* 6px - Small elements (badges, pills) */
--radius: 0.5rem;        /* 8px - Default (buttons, inputs) */
--radius-lg: 0.75rem;    /* 12px - Cards, panels */
--radius-xl: 1rem;       /* 16px - Modals, large containers */
--radius-full: 9999px;   /* Full rounding (avatars, pills) */
```

### Component Mapping

| Component | Radius Token | Usage |
|-----------|--------------|-------|
| **Button** | `--radius` (8px) | Standard button rounding |
| **Input/Textarea** | `--radius` (8px) | Form fields |
| **Card** | `--radius-lg` (12px) | Content cards, panels |
| **Modal** | `--radius-xl` (16px) | Dialogs, overlays |
| **Badge** | `--radius-sm` (6px) | Status badges, tags |
| **Avatar** | `--radius-full` | Profile pictures |

### Usage Examples

```tsx
// Button with default radius (8px)
<Button className="rounded-radius">Click me</Button>

// Card with large radius (12px)
<Card className="rounded-radius-lg">
  <CardContent>Card content</CardContent>
</Card>

// Badge with small radius (6px)
<Badge className="rounded-radius-sm">New</Badge>

// Avatar with full radius
<Avatar className="rounded-radius-full" />
```

### Tailwind Integration

**Use Tailwind utilities where tokens aren't needed:**

```tsx
// Standard Tailwind utilities work too
<div className="rounded-lg">   {/* 12px, same as --radius-lg */}
<div className="rounded-xl">   {/* 16px, same as --radius-xl */}
<div className="rounded-full">  {/* 9999px, same as --radius-full */}
```

---

## Typography

### Typography Scale

Typography utilities use the `heading-` prefix to avoid conflicts with Tailwind's `text-` color utilities.

```css
/* Display (Hero headings) */
.heading-display {
  font-size: 2.25rem;    /* 36px */
  font-weight: 700;      /* bold */
  line-height: 1.2;
}

/* Heading 1 (Page titles) */
.heading-1 {
  font-size: 1.875rem;   /* 30px */
  font-weight: 600;      /* semibold */
  line-height: 1.2;
}

/* Heading 2 (Section titles) */
.heading-2 {
  font-size: 1.5rem;     /* 24px */
  font-weight: 600;      /* semibold */
  line-height: 1.3;
}

/* Heading 3 (Subsection titles) */
.heading-3 {
  font-size: 1.25rem;    /* 20px */
  font-weight: 600;      /* semibold */
  line-height: 1.4;
}

/* Heading 4 (Small headings) */
.heading-4 {
  font-size: 1.125rem;   /* 18px */
  font-weight: 600;      /* semibold */
  line-height: 1.4;
}

/* Heading 5 (Tiny headings) */
.heading-5 {
  font-size: 1rem;       /* 16px */
  font-weight: 600;      /* semibold */
  line-height: 1.5;
}

/* Body Text (Standard) */
.body-text {
  font-size: 1rem;       /* 16px */
  color: var(--foreground);
}

/* Body Text Small */
.body-text-sm {
  font-size: 0.875rem;   /* 14px */
  color: var(--foreground);
}

/* Caption (Metadata, timestamps) */
.caption-text {
  font-size: 0.875rem;   /* 14px */
  color: var(--muted-foreground);
}

/* Caption Extra Small */
.caption-text-xs {
  font-size: 0.75rem;    /* 12px */
  color: var(--muted-foreground);
}
```

### Typography Usage

```tsx
// Page title
<h1 className="heading-1">Members Directory</h1>

// Section title
<h2 className="heading-2">Active Members</h2>

// Card title
<h3 className="heading-3">John Doe</h3>

// Standard body text
<p className="body-text">
  This is standard body text with normal weight.
</p>

// Caption/metadata
<span className="caption-text">Last updated 2 hours ago</span>
```

### Font Stack

**Default:** System font stack (excellent performance)

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;
```

**Benefits:**
- Native look on each platform
- No web font loading delay
- Excellent readability
- Zero external requests

---

## Spacing

### Tailwind Spacing Scale

The design system uses **Tailwind's default spacing scale** (rem-based):

```
0   = 0px
1   = 0.25rem  (4px)
2   = 0.5rem   (8px)
3   = 0.75rem  (12px)
4   = 1rem     (16px)
5   = 1.25rem  (20px)
6   = 1.5rem   (24px)
8   = 2rem     (32px)
10  = 2.5rem   (40px)
12  = 3rem     (48px)
16  = 4rem     (64px)
```

### Spacing Guidelines

**Component Spacing:**
```tsx
// Card padding (standard)
<Card className="p-6">  {/* 24px padding */}

// Card padding (compact)
<Card className="p-4">  {/* 16px padding */}

// Form field spacing
<div className="space-y-4">  {/* 16px vertical gap */}
  <Input />
  <Input />
</div>

// Section spacing
<section className="mb-8">  {/* 32px bottom margin */}
```

**Page Layout:**
```tsx
// Page container
<div className="container mx-auto px-4 py-8">
  {/* px-4 = 16px horizontal, py-8 = 32px vertical */}
</div>

// Grid gaps
<div className="grid gap-6">  {/* 24px gap between items */}
  <Card />
  <Card />
</div>
```

### Spacing Best Practices

**DO:**
- ✅ Use consistent spacing multiples (4, 8, 16, 24, 32)
- ✅ Use `space-y-*` for vertical stacks
- ✅ Use `gap-*` for grid/flex layouts
- ✅ Test spacing at mobile breakpoints

**DON'T:**
- ❌ Use arbitrary values: `p-[13px]`
- ❌ Mix spacing scales inconsistently
- ❌ Forget responsive spacing (`sm:p-4`, `lg:p-8`)

---

## Component Library

### Button

**Location:** `web/components/ui-flowbite/button.tsx`

#### Variants

```tsx
// Primary action (filled, brand color)
<Button variant="default">Save Changes</Button>

// Secondary action (outlined)
<Button variant="outline">Cancel</Button>

// Destructive action (red, for delete/remove)
<Button variant="destructive">Delete</Button>

// Tertiary action (transparent, minimal)
<Button variant="ghost">Edit</Button>

// Alternative action (gray fill)
<Button variant="secondary">View Details</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>  {/* Square button for icons */}
```

#### States

```tsx
// Disabled
<Button disabled>Cannot Click</Button>

// Loading
<Button disabled>
  <Spinner className="mr-2" />
  Loading...
</Button>
```

#### Usage Guidelines

**When to Use:**
- `variant="default"` → Primary actions (submit, save, create)
- `variant="outline"` → Secondary actions (cancel, back, view)
- `variant="destructive"` → Dangerous actions (delete, archive, remove)
- `variant="ghost"` → Tertiary actions (icon buttons, menu items)
- `variant="secondary"` → Alternative actions (less emphasis than default)

**Best Practices:**
- Use only ONE primary button per section
- Always provide hover/focus states (built-in)
- Add loading state for async actions
- Use `size="icon"` for icon-only buttons
- Ensure ≥44px touch target on mobile

---

### Card

**Location:** `web/components/ui-flowbite/card.tsx`

#### Basic Usage

```tsx
<Card className="shadow-sm hover:shadow-md">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting text</CardDescription>
  </CardHeader>
  <CardContent>
    Main card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Elevation

```tsx
// Default card (subtle shadow)
<Card className="shadow-sm">

// Interactive card (elevates on hover)
<Card className="shadow-sm hover:shadow-md transition-shadow">

// Prominent card (no hover needed)
<Card className="shadow-md">
```

#### Card Patterns

```tsx
// List item card
<Card className="shadow-sm">
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <span>{item.name}</span>
      <Button variant="ghost" size="icon">⋮</Button>
    </div>
  </CardContent>
</Card>

// Stat card
<Card className="shadow-sm">
  <CardContent className="p-6">
    <div className="text-2xl font-bold">{count}</div>
    <p className="caption-text">Total Members</p>
  </CardContent>
</Card>
```

#### Usage Guidelines

**DO:**
- ✅ Use `shadow-sm` for default elevation
- ✅ Add `hover:shadow-md` for interactive cards
- ✅ Use `CardHeader`, `CardContent`, `CardFooter` structure
- ✅ Keep padding consistent (`p-4` or `p-6`)

**DON'T:**
- ❌ Use heavy shadows (`shadow-xl` on cards)
- ❌ Nest cards deeply (max 2 levels)
- ❌ Forget to set background (`bg-card` is default)

---

### Input & Textarea

**Location:** `web/components/ui-flowbite/input.tsx`, `textarea.tsx`

#### Basic Usage

```tsx
// Standard input
<Input 
  type="text" 
  placeholder="Enter name"
  value={value}
  onChange={handleChange}
/>

// Input with error state
<Input 
  error={true}
  placeholder="Email address"
/>

// Textarea
<Textarea 
  placeholder="Enter description"
  rows={4}
/>
```

#### Error States

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email"
    error={!!errors.email}
    placeholder="you@example.com"
  />
  {errors.email && (
    <p className="text-sm text-destructive">{errors.email}</p>
  )}
</div>
```

#### Form Patterns

```tsx
// Form group
<div className="space-y-4">
  <div>
    <Label htmlFor="name">Full Name</Label>
    <Input id="name" placeholder="John Doe" />
  </div>
  
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" error={hasError} />
    {hasError && <p className="text-destructive text-sm">Invalid email</p>}
  </div>
  
  <Button type="submit">Submit</Button>
</div>
```

#### Usage Guidelines

**DO:**
- ✅ Always pair inputs with labels (accessibility)
- ✅ Show error states with `error={true}` prop
- ✅ Display error messages below input
- ✅ Use placeholder text for examples, not labels

**DON'T:**
- ❌ Use placeholder as the only label (accessibility fail)
- ❌ Forget to show validation errors
- ❌ Mix error styling (always use `error` prop)

---

## Accessibility

### Focus States

All interactive elements have visible focus states via universal selector:

```css
*:focus-visible {
  outline: none;
  ring: 2px solid var(--ring);
  ring-offset: 2px;
  ring-offset-color: var(--background);
}
```

**Testing Focus States:**
1. Press `Tab` to navigate through interactive elements
2. Verify visible blue ring appears on focused element
3. Test in both light and dark modes
4. Ensure focus order is logical (top-to-bottom, left-to-right)

### Motion Preferences

The design system respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**What This Does:**
- Disables all animations for users with vestibular disorders
- Reduces transitions to near-instantaneous (0.01ms)
- Disables smooth scrolling
- Critical for WCAG 2.1 Animation from Interactions guideline

**Testing:**
- macOS: System Preferences → Accessibility → Display → Reduce motion
- Windows: Settings → Ease of Access → Display → Show animations
- DevTools: Emulate CSS media feature `prefers-reduced-motion`

### Color Contrast

**WCAG 2.1 AA Requirements:**
- Normal text (< 18px): **4.5:1** contrast ratio
- Large text (≥ 18px or ≥ 14px bold): **3:1** contrast ratio
- UI components and focus indicators: **3:1** contrast ratio

**Current Contrast Ratios:**
- Background vs Card (light mode): **Subtle, decorative only**
- Primary button text: **≥ 4.5:1** ✅
- Body text on background: **≥ 4.5:1** ✅
- Muted text on background: **≥ 4.5:1** ✅

**Validation Tools:**
- Chrome DevTools: Inspect → Accessibility pane
- axe DevTools extension
- WebAIM Contrast Checker

### Keyboard Navigation

**All interactive elements must be keyboard accessible:**

```tsx
// ✅ Good: Native button (keyboard accessible)
<button onClick={handleClick}>Click me</button>

// ❌ Bad: Div with onClick (not keyboard accessible)
<div onClick={handleClick}>Click me</div>

// ✅ Good: Div with role and keyboard handlers
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### Screen Reader Support

**Use semantic HTML:**

```tsx
// ✅ Good: Semantic structure
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

<main>
  <h1>Page Title</h1>
  <section aria-labelledby="members-heading">
    <h2 id="members-heading">Members</h2>
  </section>
</main>

<aside aria-label="Sidebar">
  <h2>Quick Actions</h2>
</aside>
```

**ARIA Labels for Icon Buttons:**

```tsx
// ✅ Good: Icon button with aria-label
<Button 
  variant="ghost" 
  size="icon"
  aria-label="Delete member"
>
  🗑️
</Button>

// ❌ Bad: Icon button without label
<Button variant="ghost" size="icon">
  🗑️
</Button>
```

---

## Page Patterns

### Standard Page Layout

```tsx
export default function MembersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="heading-1">Members Directory</h1>
        <p className="caption-text mt-2">
          Manage your church members and their information
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex justify-between items-center mb-6">
        <Input 
          placeholder="Search members..."
          className="max-w-sm"
        />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map(member => (
          <Card key={member.id} className="shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              {/* Card content */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Modal Pattern

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="shadow-lg rounded-radius-xl">
    <DialogHeader>
      <DialogTitle className="heading-2">Edit Member</DialogTitle>
      <DialogDescription className="caption-text">
        Update member information
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <Input label="Full Name" />
      <Input label="Email" type="email" />
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### List Page Pattern

```tsx
<div className="space-y-4">
  {items.map(item => (
    <Card 
      key={item.id}
      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/items/${item.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="heading-4">{item.title}</h3>
            <p className="caption-text">{item.description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### Form Page Pattern

```tsx
<Card className="shadow-sm max-w-2xl mx-auto">
  <CardHeader>
    <CardTitle className="heading-2">Create Event</CardTitle>
    <CardDescription>Fill in the event details</CardDescription>
  </CardHeader>
  
  <CardContent>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input 
          id="title" 
          error={!!errors.title}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">
            {errors.title.message}
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          rows={4}
          {...register('description')}
        />
      </div>
      
      <CardFooter className="px-0 flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit">
          Create Event
        </Button>
      </CardFooter>
    </form>
  </CardContent>
</Card>
```

---

## Migration Guide

### Adopting the Design System

#### For New Features

**1. Use Design Tokens (Not Hardcoded Values)**

```tsx
// ❌ Bad: Hardcoded colors
<div className="bg-white text-black">

// ✅ Good: Design tokens
<div className="bg-card text-foreground">
```

**2. Use Shadow Scale Appropriately**

```tsx
// ❌ Bad: Heavy shadow on cards
<Card className="shadow-xl">

// ✅ Good: Subtle shadow with hover
<Card className="shadow-sm hover:shadow-md">
```

**3. Use Component Library**

```tsx
// ❌ Bad: Custom button styling
<button className="px-4 py-2 bg-blue-500 text-white rounded">

// ✅ Good: Use Button component
<Button variant="default">Click me</Button>
```

#### Updating Existing Features

**Phase 1: Audit Current Styling**
- Identify hardcoded colors (`bg-white`, `bg-gray-100`)
- Find inconsistent shadows
- List components needing updates

**Phase 2: Replace Colors with Tokens**

```tsx
// Before
<div className="bg-white text-gray-900">

// After
<div className="bg-card text-card-foreground">
```

**Phase 3: Apply Shadow Scale**

```tsx
// Before
<Card className="shadow-2xl">

// After
<Card className="shadow-sm hover:shadow-md">
```

**Phase 4: Test Accessibility**
- Verify keyboard navigation works
- Test in light and dark modes
- Run axe DevTools scan
- Check color contrast

#### Common Migrations

**White Backgrounds → Card Token**

```tsx
// Before: bg-white, bg-gray-50, bg-gray-100
<div className="bg-white">

// After: bg-card
<div className="bg-card">
```

**Hardcoded Shadows → Tailwind Scale**

```tsx
// Before: Custom shadow values
<Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>

// After: Tailwind utilities
<Card className="shadow-sm hover:shadow-md">
```

**Custom Buttons → Button Component**

```tsx
// Before: Manual button styling
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Submit
</button>

// After: Button component with variant
<Button variant="default">Submit</Button>
```

### Testing Checklist

After adopting the design system:

- [ ] Test in light mode (default theme)
- [ ] Test in dark mode (toggle theme)
- [ ] Verify keyboard navigation (Tab through UI)
- [ ] Check focus states visible (blue ring on focus)
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Run axe DevTools accessibility scan (0 violations)
- [ ] Verify color contrast ≥ 4.5:1 for text
- [ ] Test responsive at 375px, 768px, 1024px, 1440px
- [ ] Ensure touch targets ≥44px on mobile
- [ ] Confirm all interactive elements are keyboard accessible

---

## Resources

### Documentation

- **Coding Standards:** `docs/CODING_STANDARDS.md`
- **Flowbite Migration:** `docs/FLOWBITE_MIGRATION.md`
- **Architecture:** `docs/source-of-truth/ARCHITECTURE.md`
- **Component Source:** `web/components/ui-flowbite/`

### External References

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Flowbite React:** https://flowbite-react.com/
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/

### Tools

- **axe DevTools:** Browser extension for accessibility testing
- **Lighthouse:** Built into Chrome DevTools
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Blindness Simulator:** https://www.toptal.com/designers/colorfilter

---

## Changelog

### Version 1.0.0 (2025-11-06)

**Initial Release** - Complete design system documentation

- Defined color system with light/dark mode tokens
- Established shadow scale using Tailwind utilities
- Documented border radius tokens
- Created typography scale with custom utilities
- Defined component library (Button, Card, Input, Textarea)
- Established accessibility guidelines (WCAG 2.1 AA)
- Provided page patterns and migration guide

**Key Design Decisions:**
- Use Tailwind shadow utilities (not custom CSS variables)
- Subtle shadows for modern, clean aesthetic
- CSS custom properties for theme tokens (HSL color space)
- Universal focus-visible selector for keyboard navigation
- Motion preferences support for accessibility

---

## Maintenance

### Updating the Design System

**When to Update:**
- Adding new design tokens (colors, spacing, etc.)
- Introducing new component variants
- Changing default styles (shadows, radius, etc.)
- Improving accessibility (new WCAG guidelines)

**Update Process:**
1. Update `web/app/globals.css` (authoritative source)
2. Update this documentation (`docs/DESIGN_SYSTEM.md`)
3. Update `docs/CODING_STANDARDS.md` (if guidelines change)
4. Test changes in light + dark modes
5. Run E2E tests to catch regressions
6. Document changes in Changelog section

### Version Numbering

- **Major (2.0.0):** Breaking changes (component API changes, token removals)
- **Minor (1.1.0):** New features (new components, new tokens)
- **Patch (1.0.1):** Bug fixes (color adjustments, documentation updates)

---

**Questions or suggestions?** Open an issue or PR on the project repository.

**Maintained by:** Church Management App Team  
**Last Updated:** 2025-11-06
