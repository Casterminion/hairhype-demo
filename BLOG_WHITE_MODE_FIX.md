# Blog Cards White Mode Fix

## Issue
Blog cards in the admin panel were displaying with dark backgrounds even when white mode was active.

## Root Cause
The `BlogsPage.tsx` component had a hardcoded background color with `!important` flag:
```tsx
className="!bg-[#1C2128] ..."  // The ! prevents CSS overrides
```

The `!important` flag was preventing the global CSS theme rules from applying to the blog cards.

## Solution
Removed the `!important` flag from the background class:

### Before
```tsx
className="!bg-[#1C2128] border-white/[0.08] ..."
```

### After
```tsx
className="bg-[#1C2128] border-white/[0.08] ..."
```

This allows the CSS theme rules in `/src/admin/styles/admin-theme.css` to properly override the background color in light mode.

## Additional Fix
Also fixed a similar issue in `CalendarPage.tsx` Sheet component:
```tsx
panelClassName="!bg-[#0B0F16]"  // Changed to:
panelClassName="bg-[#0B0F16]"
```

## How It Works Now
1. **Dark Mode**: Blog cards show `#1C2128` background (dark gray)
2. **Light Mode**: CSS rule applies white background via `[data-admin-theme="light"]` selector
3. **Hover States**: Border color changes work correctly in both themes

## Testing
✅ Blog cards display with white backgrounds in light mode
✅ Blog cards display with dark backgrounds in dark mode
✅ Hover effects work correctly in both themes
✅ Text remains readable in both themes
✅ Status badges maintain visibility
✅ Build passes successfully

## Files Modified
- `/src/pages/admin/BlogsPage.tsx` - Line 286
- `/src/pages/admin/CalendarPage.tsx` - Line 1093

## Lesson Learned
**Avoid using `!important` in Tailwind classes** when implementing theme systems. It prevents CSS cascade and makes theming impossible.

### Good Practice
```tsx
className="bg-[#1C2128]"  // Can be overridden by theme CSS
```

### Bad Practice
```tsx
className="!bg-[#1C2128]"  // Blocks theme CSS from applying
```

## Prevention
To prevent this issue in the future:
1. Never use `!` prefix for theme-related classes
2. Let the CSS cascade work naturally
3. Use theme-aware utilities or CSS custom properties for colors
4. Test all components in both light and dark modes
