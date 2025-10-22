# Tooltip Component Documentation

A fully customizable, accessible tooltip component with arrow support for React applications.

## Features

✨ **Fully Customizable**
- 4 position options (top, bottom, left, right)
- 4 style variants (dark, light, primary, secondary)
- 3 size options (sm, md, lg)
- Optional arrow pointer
- Custom delay timing
- Custom className support

🎨 **Modern Design**
- Smooth animations (fade-in and zoom)
- Responsive and accessible
- Consistent with your design system
- Primary/Secondary color support

♿ **Accessible**
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly

## Installation

The component is already created at `src/components/Common/Tooltip.jsx`. Just import and use it!

```jsx
import Tooltip from './components/Common/Tooltip';
```

## Basic Usage

```jsx
<Tooltip content="This is a tooltip">
  <button>Hover me</button>
</Tooltip>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | The element that triggers the tooltip |
| `content` | string | required | The tooltip content/text |
| `position` | string | `'top'` | Position: 'top', 'bottom', 'left', 'right' |
| `variant` | string | `'dark'` | Style: 'dark', 'light', 'primary', 'secondary' |
| `size` | string | `'md'` | Size: 'sm', 'md', 'lg' |
| `delay` | number | `200` | Delay before showing (in milliseconds) |
| `arrow` | boolean | `true` | Show/hide arrow pointer |
| `className` | string | `''` | Additional custom CSS classes |
| `disabled` | boolean | `false` | Disable the tooltip |

## Examples

### Different Positions

```jsx
<Tooltip content="Top tooltip" position="top">
  <button>Top</button>
</Tooltip>

<Tooltip content="Bottom tooltip" position="bottom">
  <button>Bottom</button>
</Tooltip>

<Tooltip content="Left tooltip" position="left">
  <button>Left</button>
</Tooltip>

<Tooltip content="Right tooltip" position="right">
  <button>Right</button>
</Tooltip>
```

### Different Variants

```jsx
{/* Dark (default) - gray/black background */}
<Tooltip content="Dark variant" variant="dark">
  <button>Dark</button>
</Tooltip>

{/* Light - white background with shadow */}
<Tooltip content="Light variant" variant="light">
  <button>Light</button>
</Tooltip>

{/* Primary - your primary brand color */}
<Tooltip content="Primary variant" variant="primary">
  <button>Primary</button>
</Tooltip>

{/* Secondary - your secondary brand color */}
<Tooltip content="Secondary variant" variant="secondary">
  <button>Secondary</button>
</Tooltip>
```

### Different Sizes

```jsx
<Tooltip content="Small" size="sm">
  <button>Small</button>
</Tooltip>

<Tooltip content="Medium (default)" size="md">
  <button>Medium</button>
</Tooltip>

<Tooltip content="Large with more content" size="lg">
  <button>Large</button>
</Tooltip>
```

### Without Arrow

```jsx
<Tooltip content="No arrow" arrow={false}>
  <button>No Arrow</button>
</Tooltip>
```

### Custom Delay

```jsx
{/* Instant (no delay) */}
<Tooltip content="Instant" delay={0}>
  <button>Instant</button>
</Tooltip>

{/* 500ms delay */}
<Tooltip content="Delayed" delay={500}>
  <button>Delayed</button>
</Tooltip>
```

### Disabled Tooltip

```jsx
<Tooltip content="Won't show" disabled>
  <button disabled>Disabled</button>
</Tooltip>
```

### Custom Styling

```jsx
<Tooltip 
  content="Custom styles" 
  className="!bg-gradient-to-r !from-purple-500 !to-pink-500"
>
  <button>Custom</button>
</Tooltip>
```

## Real-World Use Cases

### Product Card Icons

```jsx
import { FaHeart, FaShoppingCart, FaInfoCircle } from 'react-icons/fa';

<div className="product-card">
  <Tooltip content="Add to favorites" position="top" variant="primary">
    <button onClick={addToFavorites}>
      <FaHeart />
    </button>
  </Tooltip>

  <Tooltip content="Add to cart" position="top" variant="secondary">
    <button onClick={addToCart}>
      <FaShoppingCart />
    </button>
  </Tooltip>

  <Tooltip content="View details" position="top">
    <button onClick={viewDetails}>
      <FaInfoCircle />
    </button>
  </Tooltip>
</div>
```

### Form Help Text

```jsx
<div className="form-field">
  <label>
    Password
    <Tooltip 
      content="Password must be at least 8 characters with uppercase, lowercase, and numbers"
      variant="light"
      size="lg"
      position="right"
    >
      <FaInfoCircle className="ml-2 cursor-help" />
    </Tooltip>
  </label>
  <input type="password" />
</div>
```

### User Avatar

```jsx
<Tooltip content="View profile" variant="primary">
  <img 
    src={user.avatar} 
    alt={user.name}
    className="rounded-full cursor-pointer"
  />
</Tooltip>
```

### Navigation Icons

```jsx
<Tooltip content="Dashboard" position="right" variant="dark">
  <FaDashboard className="nav-icon" />
</Tooltip>

<Tooltip content="Settings" position="right" variant="dark">
  <FaCog className="nav-icon" />
</Tooltip>
```

### Disabled Actions

```jsx
<Tooltip 
  content="You don't have permission to delete this item"
  variant="light"
  position="top"
>
  <button disabled className="opacity-50 cursor-not-allowed">
    Delete
  </button>
</Tooltip>
```

## Advanced Customization

### Color Variants

The tooltip uses your Tailwind config colors:
- **dark**: `bg-gray-900` / `text-white`
- **light**: `bg-white` / `text-gray-900` with shadow
- **primary**: `bg-primary` / `text-white` (your primary color)
- **secondary**: `bg-secondary` / `text-white` (your secondary color)

### Size Specifications

- **sm**: `px-2 py-1 text-xs max-w-xs` (max ~20rem)
- **md**: `px-3 py-2 text-sm max-w-sm` (max ~24rem)
- **lg**: `px-4 py-3 text-base max-w-md` (max ~28rem)

### Arrow Sizes

Arrow size automatically matches tooltip size:
- **sm**: 4px border
- **md**: 6px border
- **lg**: 8px border

## Animation

The tooltip includes smooth animations:
- Fade in effect
- Zoom in (95% to 100%)
- 200ms duration
- Configurable delay before showing

## Accessibility

The component includes:
- `role="tooltip"` attribute
- Proper hover states
- Keyboard navigation support (via native browser)
- Works with screen readers

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Tips & Best Practices

1. **Keep content concise**: Tooltips should provide brief, helpful information
2. **Use appropriate positions**: Ensure tooltips don't overflow viewport
3. **Choose the right variant**: Match tooltip style to context (e.g., error tooltips in red)
4. **Consider mobile**: Tooltips may not work well on touch devices (hover-based)
5. **Add delay for UX**: Default 200ms prevents accidental triggers
6. **Use with icons**: Great for explaining icon actions without cluttering UI
7. **Accessibility**: Don't rely solely on tooltips for critical information

## View Examples

To see all examples and variations in action:

1. Import the example component:
```jsx
import TooltipExample from './components/Common/TooltipExample';
```

2. Use it in your routes or pages:
```jsx
<Route path="/tooltip-examples" element={<TooltipExample />} />
```

## Troubleshooting

**Tooltip not showing:**
- Check if `content` prop is provided and not empty
- Ensure `disabled` is not set to `true`
- Verify parent has proper positioning context

**Arrow misaligned:**
- Check if you're overriding positioning with custom classes
- Ensure wrapper has `relative` positioning

**Tooltip cut off:**
- Parent container might have `overflow: hidden`
- Try different `position` prop value
- Adjust size with `size` prop

## Need Help?

For more examples and customization options, check:
- `src/components/Common/Tooltip.jsx` - Component source
- `src/components/Common/TooltipExample.jsx` - Live examples

