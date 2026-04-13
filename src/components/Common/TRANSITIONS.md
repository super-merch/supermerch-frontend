# Page Transition System

This directory contains reusable page transition components for smooth animations throughout the website.

## Components

### 1. RouteTransition (Main Component)

The primary component that handles all page transitions automatically.

**Features:**

- Automatic route detection
- Different animations for different page types
- Loading bar indicator
- Smooth transitions between pages

**Usage:**

```jsx
import RouteTransition from "./components/Common/RouteTransition";

<RouteTransition>
  <Routes>{/* Your routes */}</Routes>
</RouteTransition>;
```

### 2. TransitionWrapper

A flexible wrapper for custom animations on any component.

**Props:**

- `type`: Animation type ("fade", "slideUp", "slideDown", "slideLeft", "slideRight", "scale", "flip")
- `duration`: Animation duration in seconds
- `delay`: Animation delay in seconds
- `showLoadingBar`: Show loading bar (boolean)

**Usage:**

```jsx
import TransitionWrapper from "./components/Common/TransitionWrapper";

<TransitionWrapper type="slideUp" duration={0.5} delay={0.1}>
  <YourComponent />
</TransitionWrapper>;
```

### 3. PageTransition

Basic page transition with fade effect and loading bar.

**Usage:**

```jsx
import PageTransition from "./components/Common/PageTransition";

<PageTransition>
  <YourPageContent />
</PageTransition>;
```

### 4. AnimatedRoute

Advanced route-based animations with different effects per route type.

**Usage:**

```jsx
import AnimatedRoute from "./components/Common/AnimatedRoute";

<AnimatedRoute animationType="scale" duration={0.6}>
  <YourPageContent />
</AnimatedRoute>;
```

### 5. LoadingBar

A customizable loading bar component.

**Props:**

- `isVisible`: Show/hide the loading bar
- `color`: Color theme ("blue", "purple", "green", "red", "yellow")

**Usage:**

```jsx
import LoadingBar from "./components/Common/LoadingBar";

<LoadingBar isVisible={isLoading} color="purple" />;
```

## Animation Types

### Route-Specific Animations

- **Home page**: Slide up with scale effect
- **Product pages**: Zoom in effect
- **Admin pages**: Slide from left
- **Shop/Category pages**: Slide up
- **Auth pages**: Fade with scale
- **Cart/Checkout pages**: Slide from right
- **Default**: Fade with slide

### Available Animation Types

1. **fade**: Simple opacity transition
2. **slideUp**: Slide up from bottom
3. **slideDown**: Slide down from top
4. **slideLeft**: Slide from right
5. **slideRight**: Slide from left
6. **scale**: Scale in/out effect
7. **flip**: 3D flip effect

## Customization

### Adding New Route Animations

Edit `RouteTransition.jsx` and add new conditions in the `getPageVariants` function:

```jsx
// Example: Special animation for blog pages
if (pathname.includes("/blog")) {
  return {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
    transition: { duration: 0.6, ease: "easeInOut" },
  };
}
```

### Custom Animation Variants

Create custom variants in `TransitionWrapper.jsx`:

```jsx
const customVariants = {
  bounce: {
    initial: { opacity: 0, y: -100 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    out: { opacity: 0, y: 100 },
  },
};
```

## Performance Tips

1. **Use `mode="wait"`** in AnimatePresence to prevent overlapping animations
2. **Keep durations short** (0.3-0.5 seconds) for better UX
3. **Use `easeInOut`** for smooth transitions
4. **Avoid complex animations** on mobile devices
5. **Test on different devices** to ensure smooth performance

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires Framer Motion library

## Dependencies

- `framer-motion`: For animations
- `react-router-dom`: For route detection
- `prop-types`: For prop validation
