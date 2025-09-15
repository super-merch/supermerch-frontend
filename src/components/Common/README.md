# Reusable Components Documentation

## Modal Component

A highly reusable modal component with multiple variants and configurations.

### Usage

```jsx
import { Modal } from "../Common";

<Modal isOpen={isOpen} onClose={onClose} size="md" variant="centered" animation="fade">
  <div>Modal content here</div>
</Modal>;
```

### Props

| Prop                   | Type     | Default   | Description                                        |
| ---------------------- | -------- | --------- | -------------------------------------------------- |
| `isOpen`               | boolean  | required  | Controls modal visibility                          |
| `onClose`              | function | required  | Callback when modal should close                   |
| `children`             | node     | required  | Modal content                                      |
| `size`                 | string   | "md"      | Size: "sm", "md", "lg", "xl", "2xl", "3xl", "full" |
| `variant`              | string   | "default" | Layout: "default", "centered", "bottom", "fancy"   |
| `showBackdrop`         | boolean  | true      | Show backdrop overlay                              |
| `backdropClassName`    | string   | ""        | Custom backdrop classes                            |
| `className`            | string   | ""        | Custom modal classes                               |
| `closeOnBackdropClick` | boolean  | true      | Close when backdrop clicked                        |
| `closeOnEscape`        | boolean  | true      | Close when Escape key pressed                      |
| `showCloseButton`      | boolean  | true      | Show close button                                  |
| `closeButtonClassName` | string   | ""        | Custom close button classes                        |
| `animation`            | string   | "fade"    | Animation: "fade", "scale", "slide", "none"        |

## Custom Hooks

### useModals

Manages modal state across the application.

```jsx
import { useModals } from "../../hooks/useModals";

const {
  discountModal,
  emailModal,
  cookieModal,
  openDiscountModal,
  closeDiscountModal,
  // ... other controls
} = useModals();
```

### useEmailSubscription

Handles email subscription logic with validation.

```jsx
import { useEmailSubscription } from "../../hooks/useEmailSubscription";

const { emailInput, setEmailInput, loading, error, handleSubmit, resetForm } = useEmailSubscription();
```

### useCoupons

Manages coupon data and fetching.

```jsx
import { useCoupons } from "../../hooks/useCoupons";

const { coupons, selectedCoupon, coupenLoading, fetchCurrentCoupon } = useCoupons();
```

### useSessionStorage

Persistent state management with session storage.

```jsx
import { useSessionStorage, useSessionStorageBoolean } from "../../hooks/useSessionStorage";

const [value, setValue] = useSessionStorage("key", defaultValue);
const [booleanValue, setBooleanValue] = useSessionStorageBoolean("key", false);
```

## Specific Modal Components

### DiscountModal

Pre-configured modal for discount display.

```jsx
import { DiscountModal } from "./Modals";

<DiscountModal isOpen={isOpen} onClose={onClose} onSubscribe={onSubscribe} selectedCoupon={selectedCoupon} coupenLoading={coupenLoading} />;
```

### EmailModal

Pre-configured modal for email collection.

```jsx
import { EmailModal } from "./Modals";

<EmailModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={onSubmit}
  emailInput={emailInput}
  setEmailInput={setEmailInput}
  error={error}
  loading={loading}
/>;
```

### CookieModal

Pre-configured modal for cookie consent.

```jsx
import { CookieModal } from "./Modals";

<CookieModal isOpen={isOpen} onClose={onClose} onAccept={onAccept} onDecline={onDecline} />;
```

## Benefits

1. **Reusability**: Components can be used across the entire application
2. **Consistency**: Uniform modal behavior and styling
3. **Maintainability**: Centralized modal logic and state management
4. **Type Safety**: PropTypes validation for all components
5. **Performance**: Optimized with useCallback and proper dependency arrays
6. **Accessibility**: Proper ARIA labels and keyboard navigation
7. **Flexibility**: Highly configurable with sensible defaults
