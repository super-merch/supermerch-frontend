import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoCheckmarkCircle, IoClose, IoInformationCircle } from 'react-icons/io5';
import Skeleton from 'react-loading-skeleton';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css';
import noimage from '/noimage.png';
import { findNearestColor, toProductUrl } from '@/utils/utils';
import { addToCart } from '@/redux/slices/cartSlice';
import DealCustomizationModal from '@/components/deals/DealCustomizationModal';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const roundToTwo = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const formatPrice = (price) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(Number(price || 0));

const getPriceForQuantity = (quantity, priceBreaks = []) => {
  if (!Array.isArray(priceBreaks) || priceBreaks.length === 0) return 0;

  const sortedBreaks = [...priceBreaks].sort((a, b) => a.qty - b.qty);
  for (let index = sortedBreaks.length - 1; index >= 0; index -= 1) {
    if (quantity >= Number(sortedBreaks[index].qty || 0)) {
      return Number(sortedBreaks[index].price || 0);
    }
  }

  return Number(sortedBreaks[0]?.price || 0);
};

const getBasePriceBreaks = (productData) => {
  const priceGroups = productData?.product?.prices?.price_groups || [];
  const basePriceData = priceGroups.find((group) => group?.base_price)?.base_price;
  return basePriceData?.price_breaks || [];
};

const DealDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selections, setSelections] = useState({});
  const [productCache, setProductCache] = useState({});
  const [loadingProductKey, setLoadingProductKey] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    slotId: null,
    productChoiceId: null,
    productKey: '',
    productImage: '',
    color: null,
    selectedSize: '',
    selectedArtworkKey: '',
    selectedQuantity: 0,
    sizeQuantities: {},
  });

  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [slotCustomizations, setSlotCustomizations] = useState({});

  const resetModal = () => {
    setModal({
      isOpen: false,
      slotId: null,
      productChoiceId: null,
      productKey: '',
      productImage: '',
      color: null,
      selectedSize: '',
      selectedArtworkKey: '',
      selectedQuantity: 0,
      sizeQuantities: {},
    });
  };

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${backendUrl}/api/frontend/deal/${slug}`);
        const data = await response.json();

        if (!data?.success || !data?.data) {
          setError(data?.message || 'Failed to load deal');
          return;
        }

        setDeal(data.data);
        const initialSelections = {};
        data.data.productSlots?.forEach((slot) => {
          const defaultChoice = slot.productChoices?.find((c) => c.isDefault) || slot.productChoices?.[0];
          initialSelections[slot.id] = {
            productChoiceId: defaultChoice?.id || null,
            colorSelections: [],
          };
        });
        setSelections(initialSelections);
      } catch {
        setError('Unable to load deal. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchDeal();
  }, [slug, backendUrl]);

  const getProductChoice = (slot) => {
    const selected = selections[slot.id];
    if (!selected?.productChoiceId) return slot.productChoices?.[0];
    return slot.productChoices?.find((choice) => choice.id === selected.productChoiceId) || slot.productChoices?.[0];
  };

  const getSlotTotalQuantity = (slotId) => {
    const selected = selections[slotId];
    if (!selected?.colorSelections) return 0;
    return selected.colorSelections.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  };

  const getTotalItems = () => Object.keys(selections).reduce((sum, slotId) => sum + getSlotTotalQuantity(slotId), 0);

  const areSelectionsComplete = () => {
    if (!deal?.productSlots) return false;
    for (const slot of deal.productSlots) {
      const qty = getSlotTotalQuantity(slot.id);
      if (qty < Number(slot.requiredQuantity || 0)) return false;
    }
    return true;
  };

  const getProductKey = (productChoice) => String(productChoice?.product?.id || productChoice?.product?.name || '').trim();

  const fetchSingleProduct = async (productChoice) => {
    const key = getProductKey(productChoice);
    if (!key) return null;
    if (productCache[key]) return productCache[key];

    const productName = String(productChoice?.product?.name || '').trim();
    const productSlug = productName ? toProductUrl(productName).split('/').pop() : '';
    const candidates = [
      String(productChoice?.product?.id || '').trim(),
      String(productChoice?.product?.code || '').trim(),
      productSlug,
      productName,
    ].filter(Boolean);

    const uniqueCandidates = [...new Set(candidates)];

    try {
      setLoadingProductKey(key);
      for (const identifier of uniqueCandidates) {
        const response = await fetch(
          `${backendUrl}/api/single-product/${encodeURIComponent(identifier)}`,
          {
            cache: 'no-store',
            headers: {
              Accept: 'application/json',
            },
          },
        );
        if (!response.ok) {
          continue;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          continue;
        }

        const apiData = await response.json();
        const payload = apiData?.data || null;

        if (payload?.product) {
          setProductCache((prev) => ({ ...prev, [key]: payload }));
          return payload;
        }
      }

      return null;
    } catch {
      return null;
    } finally {
      setLoadingProductKey(null);
    }
  };

  // Keep swatches accurate for visible selected choices without waiting for click
  useEffect(() => {
    if (!deal?.productSlots?.length) return;
    deal.productSlots.forEach((slot) => {
      const choice = getProductChoice(slot);
      if (choice?.product) fetchSingleProduct(choice);
    });
  }, [deal, selections]);

  const extractSizesFromProduct = (productData) => {
    const details = productData?.product?.details || [];
    const detailString =
      details.find((d) =>
        ['sizing', 'sizes', 'size', 'product sizes'].includes(String(d?.name || '').toLowerCase()),
      )?.detail || '';

    const headerSizes = String(detailString)
      .split('\n')[0]
      .split(/[|,;:]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (headerSizes.length) return headerSizes;

    const description = productData?.product?.description || '';
    const sizesMatch = description.match(/Sizes:\s*([^\n]+)/i);
    if (!sizesMatch) return [];

    const sizesString = sizesMatch[1].trim();
    if (sizesString.includes(' - ')) {
      const [start, end] = sizesString.split(' - ').map((s) => s.trim());
      const startIndex = SIZE_ORDER.indexOf(start);
      const endIndex = SIZE_ORDER.indexOf(end);
      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        return SIZE_ORDER.slice(startIndex, endIndex + 1);
      }
      return [sizesString];
    }

    return sizesString
      .split(/[|,;:]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const normalizeSizes = (sizes = []) => {
    return sizes
      .map((s) => String(s || '').trim())
      .filter(Boolean)
      .filter((s) => !['FRE', 'FREE', 'ONE SIZE'].includes(s.toUpperCase()));
  };

  const resolveModalSizes = (color, productData) => {
    const colorSizesRaw = (color?.sizes || []).map((s) => s?.name);
    const colorSizes = normalizeSizes(colorSizesRaw);
    const parsedSizes = normalizeSizes(extractSizesFromProduct(productData));

    // Product page behavior: prefer explicit product sizing (XS/S/M...) over generic placeholders.
    if (parsedSizes.length > 0) return parsedSizes;
    if (colorSizes.length > 0) return colorSizes;

    return ['Standard'];
  };

  const getColorVisual = (colorItem, productChoice) => {
    const cachedProduct = productCache[getProductKey(productChoice)]?.product;
    const matchingColor = cachedProduct?.colours?.list?.find((item) => {
      const joined = (item?.colours || []).join('/').toLowerCase();
      return (
        (item?.name || '').toLowerCase() === (colorItem?.name || '').toLowerCase() ||
        joined === (colorItem?.name || '').toLowerCase()
      );
    });

    if (matchingColor?.swatch?.length > 1) {
      return {
        background: `linear-gradient(135deg, ${matchingColor.swatch[0]} 50%, ${matchingColor.swatch[1]} 50%)`,
      };
    }
    if (matchingColor?.swatch?.[0]) {
      return { backgroundColor: matchingColor.swatch[0] };
    }
    if (colorItem?.hexCode) {
      return { backgroundColor: colorItem.hexCode };
    }

    const parts = String(colorItem?.name || '')
      .split('/')
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length > 1) {
      const c1 = findNearestColor(parts[0]);
      const c2 = findNearestColor(parts[1]);
      return {
        background: `linear-gradient(135deg, ${c1?.hex || '#9ca3af'} 50%, ${c2?.hex || '#6b7280'} 50%)`,
      };
    }

    const c = findNearestColor(parts[0] || colorItem?.name || '');
    return { backgroundColor: c?.hex || '#9ca3af' };
  };

  const resolveImageUrlForDeal = (url) => {
    if (!url) return noimage;
    return String(url).startsWith('http') ? url : `${backendUrl}/${url}`;
  };

  const normalizeColorToken = (value) => String(value || '').trim().toLowerCase();

  const resolveColorImageForModal = (productData, color, fallbackImage) => {
    const pickColorImageCandidate = (entry) => {
      if (!entry) return null;
      if (typeof entry === 'string') return entry;
      return entry.url || entry.image || null;
    };

    const directColorImage =
      color?.image ||
      color?.hero_image ||
      pickColorImageCandidate(color?.images?.[0]);

    if (directColorImage) {
      return resolveImageUrlForDeal(directColorImage);
    }

    const targetTokens = new Set(
      [
        color?.name,
        ...(Array.isArray(color?.colours) ? color.colours : []),
        ...String(color?.name || '')
          .split('/')
          .map((token) => token.trim()),
      ]
        .map(normalizeColorToken)
        .filter(Boolean),
    );

    const productColors = productData?.product?.colours?.list || [];

    for (const productColor of productColors) {
      const candidateTokens = [
        productColor?.name,
        ...(Array.isArray(productColor?.colours) ? productColor.colours : []),
        ...String(productColor?.name || '')
          .split('/')
          .map((token) => token.trim()),
      ]
        .map(normalizeColorToken)
        .filter(Boolean);

      const hasMatch = candidateTokens.some((token) => targetTokens.has(token));
      if (!hasMatch) continue;

      const matchedImage =
        productColor?.image ||
        productColor?.main_image ||
        productColor?.hero_image ||
        pickColorImageCandidate(productColor?.images?.[0]);

      if (matchedImage) {
        return resolveImageUrlForDeal(matchedImage);
      }
    }

    return resolveImageUrlForDeal(fallbackImage);
  };

  const openSizingModal = async (slotId, productChoice, color, requiredQuantity = 1) => {
    const productData = await fetchSingleProduct(productChoice);

    const modalSizes = resolveModalSizes(color, productData);
    const modalColorImage = resolveColorImageForModal(productData, color, productChoice.images?.[0]?.url);

    setModal({
      isOpen: true,
      slotId,
      productChoiceId: productChoice.id,
      productKey: getProductKey(productChoice),
      productImage: modalColorImage,
      color,
      selectedSize: modalSizes[0] || '',
      selectedArtworkKey: '',
      selectedQuantity: Math.max(Number(requiredQuantity || 1), 1),
      sizeQuantities: Object.fromEntries(modalSizes.map((size) => [size, 0])),
    });
  };

  const getModalQuantityGuard = (slotId, colorName) => {
    const colorSelections = selections?.[slotId]?.colorSelections || [];
    const slotTotal = colorSelections.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const existingColorQty = colorSelections.find((item) => item.colorName === colorName)?.quantity || 0;
    const otherColorsTotal = Math.max(slotTotal - Number(existingColorQty || 0), 0);
    const requiredQty = Math.max(Number(modal.selectedQuantity || 0), 0);
    const maxAllowedInModal = Math.max(requiredQty - otherColorsTotal, 0);

    return {
      maxAllowedInModal,
      otherColorsTotal,
    };
  };

  const handleModalSizeChange = (size, change) => {
    setModal((prev) => {
      const sizeQuantities = { ...(prev.sizeQuantities || {}) };
      const currentQty = Number(sizeQuantities[size] || 0);
      const currentTotal = Object.values(sizeQuantities).reduce((sum, qty) => sum + Number(qty || 0), 0);
      const colorName = prev.color?.name || '';
      const guard = getModalQuantityGuard(prev.slotId, colorName);

      let nextQty = Math.max(currentQty + change, 0);
      const newTotal = currentTotal - currentQty + nextQty;

      // Match workwear behavior: stop incrementing when slot required quantity is reached.
      if (newTotal > guard.maxAllowedInModal) {
        nextQty = currentQty;
      }

      sizeQuantities[size] = nextQty;

      return {
        ...prev,
        sizeQuantities,
      };
    });
  };

  const modalProduct = modal.productKey ? productCache[modal.productKey] : null;
  const modalSizes = resolveModalSizes(modal.color, modalProduct);
  const modalQty = Object.values(modal.sizeQuantities || {}).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
  const modalGuard = getModalQuantityGuard(modal.slotId, modal.color?.name || '');
  const modalUnitPrice = getPriceForQuantity(Math.max(modalQty, 1), getBasePriceBreaks(modalProduct));
  const modalTotal = roundToTwo(modalUnitPrice * modalQty);

  const confirmSelection = () => {
    const colorName = modal.color?.name || 'Selected Color';
    const qty = Number(modalQty || 0);
    if (qty <= 0) return;

    const colorHex =
      modal.color?.hexCode ||
      findNearestColor(String(colorName).split('/')[0]?.trim())?.hex ||
      '#9ca3af';

    const selectedArtworkLabel = modal.selectedArtworkKey?.trim() || '';
    const selectedSizes = Object.entries(modal.sizeQuantities || {})
      .filter(([, quantity]) => Number(quantity || 0) > 0)
      .map(([size, quantity]) => ({ size, quantity: Number(quantity || 0) }));

    setSelections((prev) => {
      const slotSelections = { ...prev[modal.slotId] };
      const existingIndex = slotSelections.colorSelections?.findIndex((item) => item.colorName === colorName) ?? -1;

      const newColorSelection = {
        colorName,
        colorHex,
        quantity: qty,
        quantityTier: qty,
        size: modalSizes.find((size) => Number(modal.sizeQuantities?.[size] || 0) > 0) || '',
        sizes: selectedSizes,
        artwork: selectedArtworkLabel || undefined,
        unitPrice: modalUnitPrice,
        totalPrice: modalTotal,
      };

      if (existingIndex >= 0) {
        slotSelections.colorSelections[existingIndex] = newColorSelection;
      } else {
        slotSelections.colorSelections = [...(slotSelections.colorSelections || []), newColorSelection];
      }

      return { ...prev, [modal.slotId]: slotSelections };
    });

    resetModal();
  };

  const removeColorSelection = (slotId, colorIndex) => {
    setSelections((prev) => {
      const slotSelections = { ...prev[slotId] };
      const next = [...(slotSelections.colorSelections || [])];
      next.splice(colorIndex, 1);
      return { ...prev, [slotId]: { ...slotSelections, colorSelections: next } };
    });
  };

  const handleAddToCart = (customizations = slotCustomizations) => {
    const looksLikeEvent = customizations && (
      typeof customizations.preventDefault === 'function' ||
      Object.prototype.hasOwnProperty.call(customizations, 'nativeEvent')
    );
    const effectiveCustomizations = looksLikeEvent ? slotCustomizations : (customizations || slotCustomizations || {});

    if (!areSelectionsComplete()) {
      toast.error('Please complete all required deal selections before adding to cart.');
      return;
    }

    const userEmail = (() => {
      try {
        return JSON.parse(localStorage.getItem('userData') || '{}')?.email || 'guest@gmail.com';
      } catch {
        return 'guest@gmail.com';
      }
    })();

    const preparedLines = [];

    (deal?.productSlots || []).forEach((slot) => {
      const selectedChoice = getProductChoice(slot);
      if (!selectedChoice?.product) return;

      const productKey = getProductKey(selectedChoice);
      const cached = productCache[productKey];
      const basePrices = getBasePriceBreaks(cached);
      const productImage = getImageUrl(selectedChoice.images?.[0]?.url);
      const colorSelections = selections?.[slot.id]?.colorSelections || [];

      colorSelections.forEach((colorSel) => {
        const qty = Number(colorSel.quantity || 0);
        const unitPrice = Number(colorSel.unitPrice || 0);
        if (qty <= 0) return;

        const slotCustomization = effectiveCustomizations?.[slot.id] || null;
        const sizeBreakdown = Array.isArray(colorSel.sizes) && colorSel.sizes.length > 0
          ? colorSel.sizes.filter((sizeItem) => Number(sizeItem.quantity || 0) > 0)
          : [{ size: colorSel.size || '', quantity: qty }];

        sizeBreakdown.forEach((sizeItem) => {
          const lineQty = Number(sizeItem.quantity || 0);
          if (lineQty <= 0) return;

          preparedLines.push({
            slot,
            selectedChoice,
            basePrices,
            productImage,
            colorSel: {
              ...colorSel,
              size: sizeItem.size || colorSel.size || '',
            },
            qty: lineQty,
            rawUnitPrice: unitPrice,
            rawLineTotal: roundToTwo(unitPrice * lineQty),
            slotCustomization,
          });
        });
      });
    });

    if (preparedLines.length === 0) {
      toast.error('No valid selections were found to add to cart.');
      return;
    }

    const rawSubtotal = roundToTwo(preparedLines.reduce((sum, line) => sum + line.rawLineTotal, 0));

    const requiredSlots = (deal?.productSlots || []).filter((slot) => !slot.isOptional && Number(slot.requiredQuantity || 0) > 0);
    const possibleBundles = requiredSlots.length > 0
      ? Math.min(
          ...requiredSlots.map((slot) => Math.floor(getSlotTotalQuantity(slot.id) / Number(slot.requiredQuantity || 1))),
        )
      : 0;

    let eligibleBundles = Math.max(Number(possibleBundles || 0), 0);
    if (!deal?.isMultiplierEnabled) {
      eligibleBundles = Math.min(eligibleBundles, 1);
    }
    if (Number(deal?.maxMultiplier || 0) > 0) {
      eligibleBundles = Math.min(eligibleBundles, Number(deal.maxMultiplier));
    }

    const bundleQuantity = Math.max(eligibleBundles, 1);
    const bundleUnitPrice = roundToTwo(Number(deal?.dealPrice || 0));
    const totalDealPrice = roundToTwo(bundleUnitPrice * bundleQuantity);
    const dealDiscountAmount = roundToTwo(Math.max(rawSubtotal - totalDealPrice, 0));
    const rawUnitPrice = roundToTwo(bundleQuantity > 0 ? rawSubtotal / bundleQuantity : rawSubtotal);
    const selectedProducts = {};

    (deal?.productSlots || []).forEach((slot) => {
      const selectedChoice = getProductChoice(slot);
      const colorSelections = selections?.[slot.id]?.colorSelections || [];
      const selectedProductKey = getProductKey(selectedChoice);
      const cachedProductId = productCache[selectedProductKey]?.product?.meta?.id;
      selectedProducts[slot.id] = {
        slotId: slot.id,
        slotName: slot.slotName,
        productChoiceId: selectedChoice?.id || null,
        productId: cachedProductId || selectedChoice?.product?.meta?.id || selectedChoice?.product?.id || null,
        colorSelections: colorSelections.map((colorSel) => ({
          ...colorSel,
          sizes: Array.isArray(colorSel.sizes)
            ? colorSel.sizes.map((sizeItem) => ({
                ...sizeItem,
                quantity: Number(sizeItem.quantity || 0),
              }))
            : [],
        })),
      };
    });

    const dealCustomizationsPayload = {};
    Object.entries(effectiveCustomizations || {}).forEach(([slotId, customization]) => {
      if (!customization || typeof customization !== 'object') return;

      dealCustomizationsPayload[slotId] = {
        slotId: customization.slotId,
        slotName: customization.slotName,
        productId: customization.productId,
        productName: customization.productName,
        productImage: customization.productImage,
        quantity: customization.quantity,
        method: customization.method
          ? {
              id: customization.method.id,
              applicationMethod: customization.method.applicationMethod,
              applicationType: customization.method.applicationType,
              setupCharge: Number(customization.method.setupCharge || 0),
            }
          : null,
        positions: Array.isArray(customization.positions)
          ? customization.positions.map((position) => ({
              id: position.id,
              positionName: position.positionName,
              positionCode: position.positionCode,
              priceAdjustment: Number(position.priceAdjustment || 0),
            }))
          : [],
        content: customization.content
          ? {
              type: customization.content.type,
              text: customization.content.text,
              imageUrl: customization.content.imageUrl,
            }
          : null,
        customizationFile: customization.customizationFile
          ? {
              preview: customization.customizationFile.preview,
              name: customization.customizationFile.name,
              type: customization.customizationFile.type,
            }
          : null,
      };
    });

    dispatch(
      addToCart({
        id: String(deal.id),
        name: deal.title || 'Deal Bundle',
        image: getImageUrl(deal.bannerImage),
        price: bundleUnitPrice,
        totalPrice: totalDealPrice,
        quantity: bundleQuantity,
        multiplier: bundleQuantity,
        userEmail,
        itemType: 'DEAL',
        type: 'deal',
        deal: {
          id: deal.id,
          title: deal.title,
          dealCode: deal.dealCode,
          bannerImage: deal.bannerImage,
          productSlots: deal.productSlots || [],
          savingsPercentage: deal.savingsPercentage,
          savingsAmount: deal.savingsAmount,
          basePrice: deal.basePrice,
          dealPrice: deal.dealPrice,
        },
        selectedProducts,
        dealSource: {
          dealId: deal.id,
          dealCode: deal.dealCode,
          dealTitle: deal.title,
        },
        hasCustomization: Object.keys(dealCustomizationsPayload).length > 0,
        customizationData: {
          ...dealCustomizationsPayload,
          pricing: {
            setupFee: 0,
            positionTotal: 0,
          },
        },
        customizationCharge: 0,
        customizationGroupId: `deal-${deal.id}-${Date.now()}`,
        addLogoLater: false,
        rawUnitPrice,
        rawLineTotal: rawSubtotal,
        lineDealDiscountAmount: dealDiscountAmount,
      }),
    );

    toast.success('Deal added to cart');
    navigate('/cart');
  };

  const handleCustomizationComplete = ({ dealCustomizations }) => {
    const customizationMap = {};
    (dealCustomizations || []).forEach((customization) => {
      customizationMap[customization.slotId] = customization;
    });
    setSlotCustomizations(customizationMap);
    setShowCustomizationModal(false);
    handleAddToCart(customizationMap);
  };

  const customizationSlots = useMemo(() => {
    return (deal?.productSlots || []).map((slot) => {
      const selectedChoice = getProductChoice(slot);
      const selectedProductKey = getProductKey(selectedChoice);
      const cachedProductId = productCache[selectedProductKey]?.product?.meta?.id;
      const selectedImage = selectedChoice?.images?.[0]?.url
        ? (selectedChoice.images[0].url.startsWith('http') ? selectedChoice.images[0].url : `${backendUrl}/${selectedChoice.images[0].url}`)
        : null;
      return {
        slotId: slot.id,
        slotName: slot.slotName,
        selectedProductId: cachedProductId || selectedChoice?.product?.meta?.id || selectedChoice?.product?.id || selectedChoice?.product?.code || slot.id,
        selectedProductName: selectedChoice?.product?.name || slot.slotName,
        selectedProductImage: selectedImage,
        selectedQuantity: getSlotTotalQuantity(slot.id) || slot.requiredQuantity || 1,
      };
    });
  }, [deal, selections, productCache]);

  const getImageUrl = (url) => {
    if (!url) return noimage;
    return url.startsWith('http') ? url : `${backendUrl}/${url}`;
  };

  if (loading) {
    return (
      <div className="Mycontainer py-10">
        <Skeleton height={400} className="mb-6" />
        <Skeleton height={40} width={300} className="mb-4" />
        <Skeleton count={3} className="mb-2" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="Mycontainer py-10 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Deal</h2>
        <p className="text-gray-600 mb-6">{error || 'Deal not found'}</p>
        <button onClick={() => navigate('/deals')} className="px-6 py-3 bg-primary text-white rounded hover:bg-primary/90">
          Back to Deals
        </button>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const isComplete = areSelectionsComplete();
  const requiredTotalItems = Number(deal?.totalItems || 0) || (deal?.productSlots || []).reduce((sum, slot) => {
    return sum + Number(slot?.requiredQuantity || 0);
  }, 0);
  const discountedPrice = roundToTwo(Number(deal?.dealPrice || 0));
  const mainPrice = roundToTwo(Number(deal?.basePrice || 0));
  const calculatedSavings = mainPrice > 0
    ? roundToTwo(Math.max(mainPrice - discountedPrice, 0))
    : roundToTwo(Number(deal?.savingsAmount || 0));
  const calculatedSavingsPercentage = mainPrice > 0
    ? Math.round((calculatedSavings / mainPrice) * 100)
    : 0;
  const pricePerItem = requiredTotalItems > 0 ? roundToTwo(discountedPrice / requiredTotalItems) : 0;
  const isInStock = typeof deal?.inStock === 'boolean' ? deal.inStock : true;
  const isDealFulfilled = isComplete;
  const isActionDisabled = !isDealFulfilled || !isInStock;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="Mycontainer py-4">
          <button onClick={() => navigate('/deals')} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <IoArrowBack className="text-xl" />
            <span>Back to Deals</span>
          </button>
        </div>
      </div>

      <div className="Mycontainer py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="relative aspect-[4/3]">
                <img src={getImageUrl(deal.bannerImage)} alt={deal.title} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 space-y-4 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{deal.title}</h1>
                {deal.description && <p className="text-sm text-gray-700 leading-relaxed">{deal.description}</p>}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(discountedPrice)}</span>
                    {mainPrice > discountedPrice && (
                      <span className="text-base text-gray-500 line-through">{formatPrice(mainPrice)}</span>
                    )}
                  </div>
                  {calculatedSavingsPercentage > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      Save {calculatedSavingsPercentage}%
                    </span>
                  )}
                </div>

                <div className="mb-3 space-y-1 text-sm text-gray-600">
                  <p>
                    Main Price (Admin): <span className="font-semibold text-gray-900">{formatPrice(mainPrice)}</span>
                  </p>
                  <p>
                    Discounted Price: <span className="font-semibold text-gray-900">{formatPrice(discountedPrice)}</span>
                  </p>
                  <p>
                    You Save: <span className="font-semibold text-green-700">{formatPrice(calculatedSavings)}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-600 block mb-1">Total Items</span>
                    <span className="text-gray-900 font-semibold">{requiredTotalItems} pieces</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-600 block mb-1">Price Per Item</span>
                    <span className="text-gray-900 font-semibold">{formatPrice(pricePerItem)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-xl p-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <span className="text-sm opacity-90">Your Selection</span>
                  <span className={`text-lg font-bold ${isComplete ? 'text-green-300' : 'text-yellow-300'}`}>
                    {totalItems}/{requiredTotalItems}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Bundle Price</span>
                  <span className="text-2xl font-bold">{formatPrice(discountedPrice)}</span>
                </div>

                {calculatedSavings > 0 && (
                  <div className="flex items-center justify-between pb-4">
                    <span className="text-sm opacity-90">You Save</span>
                    <span className="text-xl font-bold text-green-300">{formatPrice(calculatedSavings)}</span>
                  </div>
                )}

                <button
                  onClick={() => handleAddToCart()}
                  disabled={isActionDisabled}
                  className="w-full py-3 bg-white text-primary rounded-lg font-semibold hover:bg-[#EAFBF7] transition-colors disabled:cursor-not-allowed disabled:bg-[#5C8D86] disabled:text-[#E7F5F2]"
                >
                  {isComplete ? 'Add to Cart' : 'Complete Selection'}
                </button>

                {deal.includesCustomization && (
                  <button
                    onClick={() => {
                      if (isActionDisabled) return;
                      setShowCustomizationModal(true);
                    }}
                    disabled={isActionDisabled}
                    className="w-full py-3 bg-white/20 border border-white/35 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors disabled:cursor-not-allowed disabled:bg-[#5C8D86] disabled:border-[#5C8D86] disabled:text-[#E7F5F2] flex items-center justify-center gap-2"
                  >
                    <IoInformationCircle className="text-lg" />
                    Add Logo & Personalisation
                  </button>
                )}

                {!isComplete && (
                  <p className="text-xs text-center opacity-80 pt-2">
                    <i className="ri-information-line mr-1"></i>
                    Select colors and sizes for all products
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Bundle</h2>
                <p className="text-sm text-gray-600">Select products, colors and sizes using product-page pricing logic.</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-primary rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="text-primary text-xl mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">How It Works</p>
                    <ol className="text-xs text-gray-700 space-y-1">
                      <li>1. Select product for each slot</li>
                      <li>2. Click a color</li>
                      <li>3. Choose size and quantity in the popup</li>
                      <li>4. Confirm selection and add to cart</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {deal.productSlots?.map((slot, slotIndex) => {
                  const selectedChoice = getProductChoice(slot);
                  const totalQty = getSlotTotalQuantity(slot.id);
                  const progress = `${totalQty}/${slot.requiredQuantity}`;
                  const isSlotComplete = totalQty >= slot.requiredQuantity;

                  return (
                    <div key={slot.id} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                            {slotIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900">{slot.slotName}</h3>
                            <p className="text-sm text-gray-600">Required: {slot.requiredQuantity} pieces {slot.isOptional ? '(Optional)' : ''}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${isSlotComplete ? 'text-green-600' : 'text-orange-600'}`}>{progress}</div>
                      </div>

                      {slot.productChoices && slot.productChoices.length > 1 && (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Product:</label>
                          <div className="grid grid-cols-2 gap-3">
                            {slot.productChoices.map((choice) => {
                              const isActive = selectedChoice?.id === choice.id;
                              const image = choice.images?.find((img) => img.isPrimary) || choice.images?.[0];
                              return (
                                <button
                                  key={choice.id}
                                  onClick={() => {
                                    setSelections((prev) => ({
                                      ...prev,
                                      [slot.id]: {
                                        ...prev[slot.id],
                                        productChoiceId: choice.id,
                                        colorSelections: [],
                                      },
                                    }));
                                  }}
                                  className={`p-3 border-2 rounded-lg text-left transition-all ${isActive ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                  {image && (
                                    <div className="w-full aspect-square mb-2 rounded overflow-hidden bg-gray-50">
                                      <img src={getImageUrl(image.url)} alt={choice.product?.name} className="w-full h-full object-contain p-1" />
                                    </div>
                                  )}
                                  <p className="font-semibold text-xs line-clamp-2">{choice.product?.name}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedChoice?.product && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            {selectedChoice.images?.[0] && (
                              <div className="w-16 h-16 flex-shrink-0">
                                <img src={getImageUrl(selectedChoice.images[0].url)} alt={selectedChoice.product.name} className="w-full h-full object-contain rounded" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{selectedChoice.product.name}</p>
                              <p className="text-xs text-gray-600">Code: {selectedChoice.product.code}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(toProductUrl(selectedChoice.product.name))}
                            className="w-full py-2 text-xs font-medium text-primary border border-primary rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                          >
                            <IoInformationCircle className="text-sm" />
                            View Full Product Details
                          </button>
                        </div>
                      )}

                      {selectedChoice && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Colors & Sizes</label>
                          <p className="text-xs text-gray-500 mb-3">Click a color to open artwork, size and quantity selection</p>

                          <div className="flex flex-wrap gap-3 mb-3">
                            {(selectedChoice.colors || []).map((colorItem, idx) => {
                              const colorName = colorItem.name;
                              const isSelected = selections[slot.id]?.colorSelections?.some((cs) => cs.colorName === colorName);
                              return (
                                <button
                                  key={`${colorName}-${idx}`}
                                    onClick={() => openSizingModal(slot.id, selectedChoice, colorItem, slot.requiredQuantity)}
                                  className="relative group"
                                  title={colorName}
                                >
                                  <div
                                    className={`w-10 h-10 rounded-full border-2 ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-gray-300'}`}
                                    style={getColorVisual(colorItem, selectedChoice)}
                                  />
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                                      <IoCheckmarkCircle className="text-sm" />
                                    </div>
                                  )}
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {colorName}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {selections[slot.id]?.colorSelections?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-semibold text-gray-700">Selected:</p>
                              {selections[slot.id].colorSelections.map((colorSel, idx) => (
                                (() => {
                                  const selectedSizes = Array.isArray(colorSel.sizes) && colorSel.sizes.length > 0
                                    ? colorSel.sizes.filter((sizeItem) => Number(sizeItem.quantity || 0) > 0)
                                    : (colorSel.size
                                        ? [{ size: colorSel.size, quantity: Number(colorSel.quantity || 0) }]
                                        : []);
                                  const selectedQty = selectedSizes.reduce((sum, sizeItem) => sum + Number(sizeItem.quantity || 0), 0);
                                  const sizeSummary = selectedSizes
                                    .map((sizeItem) => `${sizeItem.size}: ${sizeItem.quantity}`)
                                    .join(', ');

                                  return (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-xs">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ backgroundColor: colorSel.colorHex || '#9ca3af' }} />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-gray-900 truncate">{colorSel.colorName}</p>
                                          <p className="text-gray-600">Qty: <span className="font-bold text-primary">{selectedQty || Number(colorSel.quantity || 0)}</span></p>
                                          {sizeSummary && (
                                            <p className="text-gray-600">
                                              {selectedSizes.length > 1 ? 'Sizes' : 'Size'}: <span className="font-bold">{sizeSummary}</span>
                                            </p>
                                          )}
                                          {colorSel.artwork && <p className="text-gray-600">Artwork: <span className="font-bold">{colorSel.artwork}</span></p>}
                                          {typeof colorSel.unitPrice === 'number' && <p className="text-gray-600">Unit: <span className="font-bold">A${colorSel.unitPrice.toFixed(2)}</span></p>}
                                        </div>
                                      </div>
                                      <button onClick={() => removeColorSelection(slot.id, idx)} className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0" title="Remove this color">
                                        <IoClose className="text-lg" />
                                      </button>
                                    </div>
                                  );
                                })()
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/90 text-white p-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex-1">
                <h3 className="text-xl font-bold">Select Quantity and Size</h3>
                <p className="text-sm opacity-90 mt-1">Color: {modal.color?.name}</p>
              </div>
              <button onClick={resetModal} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b bg-gray-50">
              <div className="rounded-2xl border border-[#CBD5E1] bg-white p-4 flex items-center justify-center">
                <img
                  src={modal.productImage || noimage}
                  alt={modal.color?.name || 'Selected product'}
                  className="max-h-[320px] object-contain"
                />
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Quantity Selected</p>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{modalQty}</p>
                    <p className="text-xs text-gray-500">/{modalGuard.maxAllowedInModal}</p>
                  </div>
                </div>

                {modalQty >= modalGuard.maxAllowedInModal && modalGuard.maxAllowedInModal > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    Limit reached ({modalQty}/{modalGuard.maxAllowedInModal})
                  </div>
                )}

                {modalSizes.length > 0 ? (
                  modalSizes.map((size) => {
                    const quantity = Number(modal.sizeQuantities?.[size] || 0);
                    return (
                      <div key={size} className="rounded-2xl border border-[#CBD5E1] px-4 py-3 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#F8F9FA] flex items-center justify-center font-semibold text-gray-900">
                            {size}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{size}</p>
                            <p className="text-xs text-primary">100+ available</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleModalSizeChange(size, -1)}
                            className="w-9 h-9 rounded-lg border border-[#CBD5E1] text-gray-900 hover:bg-primary/5"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                          <button
                            onClick={() => handleModalSizeChange(size, 1)}
                            disabled={modalQty >= modalGuard.maxAllowedInModal}
                            className="w-9 h-9 rounded-lg border border-[#CBD5E1] text-gray-900 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    No size data available for this product.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {loadingProductKey === modal.productKey && !modalProduct ? (
                <div className="py-8 text-center text-gray-500 text-sm">Loading pricing and size data...</div>
              ) : (
                <>
                  <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-100 flex items-center justify-between text-sm">
                    <span className="text-gray-700">Selected Total</span>
                    <span className="font-bold text-primary">A${modalTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">See size guide on product page for full measurements</p>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t-2 p-4 flex gap-3 rounded-b-2xl">
              <button onClick={resetModal} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={confirmSelection} className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                <IoCheckmarkCircle className="text-xl" />
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomizationModal && (
        <DealCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          onComplete={handleCustomizationComplete}
          slots={customizationSlots}
          initialCustomizations={slotCustomizations}
        />
      )}
    </div>
  );
};

export default DealDetailPage;
