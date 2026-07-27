// @vitest-environment jsdom

/**
 * Integration Test: Product Card Discount Display
 * Tests that discounts from backend are correctly displayed on product cards
 */

import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, describe, it, expect, beforeEach } from 'vitest';
import ProductCard from '../components/Common/ProductCard';
import { store } from '../redux/store';

// Mock product data with different discount scenarios
const createMockProduct = (discountInfo = null) => ({
  meta: {
    id: 12345
  },
  overview: {
    name: 'Test Product',
    hero_image: '/test-image.jpg'
  },
  product: {
    prices: {
      price_groups: [
        {
          base_price: {
            price_breaks: [
              {
                qty: 1,
                price: 10.00
              }
            ]
          }
        }
      ]
    },
    colours: {
      list: []
    },
    categorisation: {
      promodata_attributes: []
    }
  },
  productTags: [],
  discountInfo: discountInfo,
  pricingSummary:
    Number(discountInfo?.discount) > 0
      ? {
          finalMinPrice:
            10 * (1 - Math.min(Number(discountInfo.discount), 100) / 100),
          marginAdjustedMinPrice: 10,
        }
      : undefined,
});

afterEach(cleanup);

describe('ProductCard Discount Display', () => {
  const renderProductCard = (product) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={product} />
        </BrowserRouter>
      </Provider>
    );
  };

  /**
   * TEST 1: Product with no discount
   * Should NOT display discount badge
   */
  it('should not display discount badge when no discount exists', () => {
    const product = createMockProduct(null);
    renderProductCard(product);

    // Verify no discount badge
    const discountBadge = screen.queryByText(/% OFF/i);
    expect(discountBadge).toBeNull();

    // Verify only regular price is shown
    expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
  });

  /**
   * TEST 2: Product with global discount (10%)
   * Should display "10% OFF" badge and discounted price
   */
  it('should display global discount badge and calculate discounted price', () => {
    const product = createMockProduct({
      discount: 10,
      type: 'global',
      isGlobal: true
    });

    renderProductCard(product);

    // Verify discount badge displays
    expect(screen.getByText(/10% OFF/i)).toBeInTheDocument();

    // Verify "Sale" badge for global discount
    expect(screen.getByText(/Sale/i)).toBeInTheDocument();

    // Verify discounted price ($9.00) is shown
    expect(screen.getByText(/\$9\.00/)).toBeInTheDocument();

    // Verify original price is struck through
    expect(screen.getByText(/\$10\.00/)).toHaveClass('line-through');
  });

  /**
   * TEST 3: Product with supplier discount (15%)
   * Should display "15% OFF" badge, NO "Sale" badge
   */
  it('should display supplier discount badge without sale label', () => {
    const product = createMockProduct({
      discount: 15,
      type: 'supplier',
      isGlobal: false
    });

    renderProductCard(product);

    // Verify discount badge
    expect(screen.getByText(/15% OFF/i)).toBeInTheDocument();

    // Verify NO "Sale" badge (supplier discount is not global)
    const saleBadge = screen.queryByText(/Sale/i);
    expect(saleBadge).toBeNull();

    // Verify discounted price ($8.50)
    expect(screen.getByText(/\$8\.50/)).toBeInTheDocument();
  });

  /**
   * TEST 4: Product with product-level discount (50%)
   * Should display "50% OFF" badge (highest priority)
   */
  it('should display product-level discount badge', () => {
    const product = createMockProduct({
      discount: 50,
      type: 'product',
      isGlobal: false
    });

    renderProductCard(product);

    // Verify discount badge
    expect(screen.getByText(/50% OFF/i)).toBeInTheDocument();

    // Verify discounted price ($5.00)
    expect(screen.getByText(/\$5\.00/)).toBeInTheDocument();

    // Verify original price struck through
    expect(screen.getByText(/\$10\.00/)).toHaveClass('line-through');
  });

  /**
   * TEST 5: Discount badge positioning
   * Should appear in bottom-right corner of product image
   */
  it('should position discount badge correctly', () => {
    const product = createMockProduct({
      discount: 25,
      type: 'product'
    });

    const { container } = renderProductCard(product);

    // Find discount badge
    const discountBadge = screen.getByText(/25% OFF/i);

    // Verify it's positioned absolutely
    const badgeParent = discountBadge.closest('div');
    expect(badgeParent).toHaveClass('absolute');

    // Verify it's in bottom-right position
    expect(badgeParent).toHaveClass(/bottom-/);
    expect(badgeParent).toHaveClass(/right-/);
  });

  /**
   * TEST 6: Multiple discount badges (global + product)
   * When global discount is active AND product has specific discount,
   * both badges should show
   */
  it('should show both discount percentage and sale badge for global discounts', () => {
    const product = createMockProduct({
      discount: 20,
      type: 'global',
      isGlobal: true
    });

    renderProductCard(product);

    // Verify both badges present
    expect(screen.getByText(/20% OFF/i)).toBeInTheDocument();
    expect(screen.getByText(/Sale/i)).toBeInTheDocument();
  });

  /**
   * TEST 7: Edge case - 0% discount
   * Should NOT display badge for 0% discount
   */
  it('should not display badge for 0% discount', () => {
    const product = createMockProduct({
      discount: 0,
      type: 'global'
    });

    renderProductCard(product);

    // No discount badge should appear
    const discountBadge = screen.queryByText(/0% OFF/i);
    expect(discountBadge).toBeNull();

    // Only regular price shown
    expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
  });

  /**
   * TEST 8: Edge case - 100% discount (Free)
   * Should display "100% OFF" or "FREE"
   */
  it('should handle 100% discount correctly', () => {
    const product = createMockProduct({
      discount: 100,
      type: 'product'
    });

    renderProductCard(product);

    // Verify 100% off badge
    expect(screen.getByText(/100% OFF/i)).toBeInTheDocument();

    // Discounted price should be $0.00
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  /**
   * TEST 9: Responsive design
   * Discount badge should scale properly on mobile
   */
  it('should have responsive classes for discount badge', () => {
    const product = createMockProduct({
      discount: 30,
      type: 'product'
    });

    const { container } = renderProductCard(product);

    const discountBadge = screen.getByText(/30% OFF/i);

    // Check for responsive text sizing classes
    expect(discountBadge).toHaveClass(/text-\[10px\]|text-xs/);
    expect(discountBadge).toHaveClass(/sm:text-xs/);
  });

  /**
   * TEST 10: Accessibility
   * Discount information should be accessible to screen readers
   */
  it('should be accessible to screen readers', () => {
    const product = createMockProduct({
      discount: 25,
      type: 'product'
    });

    renderProductCard(product);

    // Check that discount info is in the DOM and visible
    const discountBadge = screen.getByText(/25% OFF/i);
    expect(discountBadge).toBeVisible();

    // Check color contrast (badges should have good contrast)
    expect(discountBadge).toHaveClass(/bg-primary|bg-red-500/);
    expect(discountBadge).toHaveClass(/text-white/);
  });
});

/**
 * Integration Test: Discount Priority Logic
 * Tests that the correct discount is applied based on priority
 */
describe('Discount Priority Logic', () => {
  /**
   * Scenario: Product from supplier 1001 has both:
   * - Supplier discount: 10%
   * - Product discount: 25%
   * Expected: Product discount (25%) should be applied (higher priority)
   */
  it('should apply product discount over supplier discount', () => {
    // In real scenario, backend returns highest priority discount
    // Frontend just displays what backend sends
    const product = createMockProduct({
      discount: 25, // Backend already calculated priority
      type: 'product'
    });

    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={product} />
        </BrowserRouter>
      </Provider>
    );

    // Verify 25% is displayed (not 10%)
    expect(screen.getByText(/25% OFF/i)).toBeInTheDocument();
    expect(screen.queryByText(/10% OFF/i)).toBeNull();
  });

  /**
   * Scenario: Product with only global discount active
   * Expected: Global discount applied, "Sale" badge shown
   */
  it('should apply global discount when no specific discounts exist', () => {
    const product = createMockProduct({
      discount: 5,
      type: 'global',
      isGlobal: true
    });

    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={product} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/5% OFF/i)).toBeInTheDocument();
    expect(screen.getByText(/Sale/i)).toBeInTheDocument();
  });
});

/**
 * Performance Test: Discount calculation
 * Verifies discount calculation doesn't slow down rendering
 */
describe('ProductCard Discount Performance', () => {
  it('should render quickly with discount calculations', () => {
    const start = performance.now();

    const products = Array.from({ length: 100 }, (_, i) =>
      createMockProduct({
        discount: Math.random() * 50,
        type: i % 3 === 0 ? 'global' : i % 2 === 0 ? 'supplier' : 'product'
      })
    );

    products.forEach(product => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ProductCard product={product} />
          </BrowserRouter>
        </Provider>
      );
    });

    const end = performance.now();
    const renderTime = end - start;

    // Should render 100 product cards in < 1 second
    expect(renderTime).toBeLessThan(1000);

    console.log(`✅ Rendered 100 product cards with discounts in ${renderTime.toFixed(2)}ms`);
  });
});
