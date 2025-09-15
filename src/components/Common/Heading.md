# Heading Component

A reusable and flexible heading component for consistent typography across the application.

## Features

- **Flexible Content**: Support for title, subtitle, and description
- **Multiple Alignments**: Left, center, right alignment options
- **Size Variants**: Small, default, large, and extra-large sizes
- **Custom Styling**: Override any class with custom className props
- **Responsive Design**: Mobile-first responsive typography
- **Accessibility**: Proper semantic HTML structure
- **Easy Maintenance**: Single source of truth for heading styles

## Usage

```jsx
import { Heading } from "../Common";

// Basic usage
<Heading title="Your Title" />

// With description
<Heading
  title="Your Title"
  description="Your description text"
/>

// With subtitle
<Heading
  subtitle="SUBTITLE"
  title="Main Title"
  description="Description text"
/>

// Custom styling
<Heading
  title="Custom Title"
  titleClassName="text-red-500 font-black"
  descriptionClassName="text-blue-600 italic"
  containerClassName="bg-gray-100 p-6 rounded-lg"
/>
```

## Props

| Prop                   | Type                                    | Default   | Description                            |
| ---------------------- | --------------------------------------- | --------- | -------------------------------------- |
| `title`                | string                                  | -         | Main heading text                      |
| `subtitle`             | string                                  | -         | Subtitle text (appears above title)    |
| `description`          | string                                  | -         | Description text (appears below title) |
| `titleClassName`       | string                                  | -         | Custom classes for title               |
| `subtitleClassName`    | string                                  | -         | Custom classes for subtitle            |
| `descriptionClassName` | string                                  | -         | Custom classes for description         |
| `containerClassName`   | string                                  | -         | Custom classes for container           |
| `align`                | "left" \| "center" \| "right"           | "center"  | Text alignment                         |
| `spacing`              | "tight" \| "normal" \| "loose"          | "normal"  | Vertical spacing between elements      |
| `size`                 | "small" \| "default" \| "large" \| "xl" | "default" | Size variant                           |
| `showUnderline`        | boolean                                 | false     | Show decorative underline              |
| `underlineClassName`   | string                                  | -         | Custom classes for underline           |
| `children`             | ReactNode                               | -         | Additional content below description   |

## Size Variants

### Small

- Title: `text-xl md:text-2xl lg:text-3xl`
- Subtitle: `text-sm md:text-base`
- Description: `text-sm md:text-base`

### Default

- Title: `text-2xl md:text-3xl lg:text-4xl`
- Subtitle: `text-base md:text-lg`
- Description: `text-base md:text-lg`

### Large

- Title: `text-3xl md:text-4xl lg:text-5xl`
- Subtitle: `text-lg md:text-xl`
- Description: `text-lg md:text-xl`

### Extra Large

- Title: `text-4xl md:text-5xl lg:text-6xl`
- Subtitle: `text-xl md:text-2xl`
- Description: `text-xl md:text-2xl`

## Common Use Cases

### Homepage Section Headers

```jsx
<Heading
  title="MORE WAY'S TO SHOP"
  align="left"
  size="default"
  titleClassName="uppercase"
  containerClassName="lg:pt-8 md:pt-8 sm:pt-8 pt-4"
/>
```

### Centered Hero Headings

```jsx
<Heading
  title="Welcome to Our Store"
  description="Discover amazing products at great prices"
  align="center"
  size="large"
  showUnderline={true}
  underlineClassName="bg-brand"
/>
```

### Product Section Headers

```jsx
<Heading title="SHOP OUR BEST SELLERS" align="left" size="default" titleClassName="uppercase" />
```

### Feature Headings

```jsx
<Heading
  subtitle="FEATURED"
  title="New Collection"
  description="Check out our latest arrivals and trending items."
  align="center"
  size="large"
  showUnderline={true}
/>
```

## Benefits

1. **Consistency**: All headings follow the same design system
2. **Maintainability**: Change styles in one place, affects all headings
3. **Flexibility**: Easy to customize for specific needs
4. **Responsive**: Automatically adapts to different screen sizes
5. **Accessibility**: Proper semantic HTML structure
6. **Performance**: Lightweight and optimized

## Migration Guide

### Before (Old Way)

```jsx
<h1 className="text-2xl font-semibold text-brand text-left lg:pt-8 md:pt-8 sm:pt-8 pt-4 pb-4 uppercase">MORE WAY'S TO SHOP</h1>
```

### After (New Way)

```jsx
<Heading
  title="MORE WAY'S TO SHOP"
  align="left"
  size="default"
  titleClassName="uppercase"
  containerClassName="lg:pt-8 md:pt-8 sm:pt-8 pt-4"
/>
```

## Design Change Requests

When you get design change requests, you can easily update headings by:

1. **Global Changes**: Modify the Heading component to affect all headings
2. **Specific Changes**: Use className props to override specific headings
3. **New Variants**: Add new size or style variants to the component
4. **Responsive Updates**: Adjust breakpoints in the component

This makes handling design changes much faster and more consistent across the entire application.
