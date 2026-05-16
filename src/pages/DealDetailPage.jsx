import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoCheckmarkCircle, IoClose, IoInformationCircle, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Skeleton from 'react-loading-skeleton';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css';
import noimage from '/noimage.png';
import { findNearestColor, toProductUrl } from '@/utils/utils';
import { addToCart } from '@/redux/slices/cartSlice';
import DealCustomizationModal from '@/components/deals/DealCustomizationModal';
import LoadingOverlay from '@/components/Common/LoadingOverlay';

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

  useEffect(() => {
    if (modal.isOpen || showCustomizationModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [modal.isOpen, showCustomizationModal]);

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

  const openSizingModal = async (slotId, productChoice, color, requiredQuantity = 1, existingSelection = null) => {
    const productData = await fetchSingleProduct(productChoice);

    const modalSizes = resolveModalSizes(color, productData);
    const modalColorImage = resolveColorImageForModal(productData, color, productChoice.images?.[0]?.url);
    const existingSizeQuantities = Object.fromEntries(
      modalSizes.map((size) => {
        const matched = (existingSelection?.sizes || []).find((s) => String(s?.size || '') === String(size));
        return [size, Number(matched?.quantity || 0)];
      }),
    );
    const existingQty = (existingSelection?.sizes || []).reduce((sum, sizeItem) => sum + Number(sizeItem?.quantity || 0), 0);

    setModal({
      isOpen: true,
      slotId,
      productChoiceId: productChoice.id,
      productKey: getProductKey(productChoice),
      productImage: modalColorImage,
      color,
      selectedSize: modalSizes[0] || '',
      selectedArtworkKey: '',
      selectedQuantity: Math.max(Number(existingQty || requiredQuantity || 1), 1),
      sizeQuantities: existingSelection ? existingSizeQuantities : Object.fromEntries(modalSizes.map((size) => [size, 0])),
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

  const handleAddToCart = (customizations = slotCustomizations, pricing = null) => {
    const looksLikeEvent = customizations && (
      typeof customizations.preventDefault === 'function' ||
      Object.prototype.hasOwnProperty.call(customizations, 'nativeEvent')
    );
    
    // If it's an event or no arguments provided, use current state
    const effectiveCustomizations = looksLikeEvent ? slotCustomizations : (customizations || slotCustomizations || {});
    const effectivePricing = (pricing && !looksLikeEvent) ? pricing : null;

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
              priceAdjustment: Number(position.pricePerApplication ?? position.priceAdjustment ?? 0),
              pricePerApplication: Number(position.pricePerApplication ?? position.priceAdjustment ?? 0),
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
          pricing: effectivePricing || {
            setupFee: 0,
            positionTotal: 0,
            totalCustomization: 0,
          },
        },
        customizationCharge: effectivePricing?.totalCustomization || 0,
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

  const handleCustomizationComplete = ({ dealCustomizations, pricing }) => {
    const customizationMap = {};
    (dealCustomizations || []).forEach((customization) => {
      customizationMap[customization.slotId] = customization;
    });
    setSlotCustomizations(customizationMap);
    setShowCustomizationModal(false);
    handleAddToCart(customizationMap, pricing);
  };

  const customizationSlots = useMemo(() => {
    return (deal?.productSlots || [])
      .filter((slot) => slot.hasCustomization)
      .map((slot) => {
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
        hasCustomization: slot.hasCustomization,
        isFreeCustomization: slot.isFreeCustomization,
        customizations: slot.customizations || [],
      };
    });
  }, [deal, selections, productCache]);

  const getImageUrl = (url) => {
    if (!url) return noimage;
    return url.startsWith('http') ? url : `${backendUrl}/${url}`;
  };

  if (loading) {
    return (
      <LoadingOverlay
        title="Loading deal"
        subtitle="Crafting your personalized product bundle..."
        variant="product"
        showBrand={true}
      />
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

                {/* Admin/discount breakdown intentionally removed per design request */}

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

              {/* Removed 'How It Works' block to match reference design */}

              <div className="space-y-6">
                {deal.productSlots?.map((slot, slotIndex) => {
                  const selectedChoice = getProductChoice(slot);
                  const totalQty = getSlotTotalQuantity(slot.id);
                  const progress = `${totalQty}/${slot.requiredQuantity}`;
                  const isSlotComplete = totalQty >= slot.requiredQuantity;

                  return (
                    <div key={slot.id} className="bg-white rounded-lg border border-[#E8ECF2] overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-[#F8F9FA] to-white px-4 py-3 border-b border-[#CBD5E1]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {slotIndex + 1}
                            </span>
                            <div>
                              <h3 className="text-base font-semibold text-[#01164F]">{slot.slotName}</h3>
                              <p className="text-xs text-[#6B7380]">
                                Required: {slot.requiredQuantity} pieces
                                {!isSlotComplete && <span className="text-[#FF4D4F] ml-2">({slot.requiredQuantity - totalQty} more needed)</span>}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isSlotComplete ? 'bg-[#25B864] bg-opacity-10 text-[#25B864]' : 'bg-[#FF4D4F] bg-opacity-10 text-[#FF4D4F]'}`}>
                            {progress}
                          </div>
                        </div>
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
                        <div className="p-4">
                          <div className="flex gap-3 mb-4">
                            <div className="w-16 h-16 bg-[#F8F9FA] rounded-lg overflow-hidden flex-shrink-0 border border-[#CBD5E1]">
                              {selectedChoice.images?.[0] ? (
                                <img src={getImageUrl(selectedChoice.images[0].url)} alt={selectedChoice.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="ri-t-shirt-line text-xl text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-[#01164F] mb-1">{selectedChoice.product.name}</h4>
                              <div className="flex items-center gap-3 text-xs">
                                <button onClick={() => navigate(toProductUrl(selectedChoice.product.name))} className="text-primary hover:underline flex items-center gap-1">
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedChoice && (
                        <div className="p-4">
                          <div>
                            <label className="text-xs font-medium text-[#6B7380] mb-2 block">Available Colors</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {(selectedChoice.colors || []).map((colorItem, idx) => {
                              const colorName = colorItem.name;
                              const isSelected = selections[slot.id]?.colorSelections?.some((cs) => cs.colorName === colorName);
                              return (
                                <button
                                  key={`${colorName}-${idx}`}
                                  onClick={() => openSizingModal(slot.id, selectedChoice, colorItem, slot.requiredQuantity)}
                                  disabled={isSelected}
                                  className={`relative group transition-all ${isSelected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                  title={colorName}
                                >
                                  <div
                                    className={`w-10 h-10 rounded-lg border-2 ${isSelected ? 'border-primary' : 'border-gray-300 hover:border-primary'}`}
                                    style={getColorVisual(colorItem, selectedChoice)}
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                                      <IoCheckmarkCircle className="text-white text-lg drop-shadow-lg" />
                                    </div>
                                  )}
                                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#6B7380] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-md z-10">
                                    {colorName}
                                  </span>
                                </button>
                              );
                            })}
                            </div>
                          </div>

                          {selections[slot.id]?.colorSelections?.length > 0 && (
                            <div className="border-t border-[#CBD5E1]">
                              {selections[slot.id].colorSelections.map((colorSel, idx) => {
                                const totalPieces = (colorSel.sizes || []).reduce((sum, size) => sum + Number(size?.quantity || 0), 0);
                                const sizeRows = colorSel.sizes || [];

                                return (
                                      <div key={idx} className="px-4 py-3 bg-[#FAFAFA] border-b border-[#CBD5E1] last:border-b-0">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div 
                                              className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0 shadow-sm"
                                              style={{ backgroundColor: colorSel.colorHex || '#ccc' }}
                                            />

                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-[#01164F]">{colorSel.colorName}</p>
                                                <span className="text-xs font-semibold text-[#6B7380] bg-white px-2 py-1 rounded">
                                                  {totalPieces} pcs
                                                </span>
                                              </div>

                                              <div className="flex flex-wrap gap-1.5">
                                                {sizeRows.map((size, sIdx) => (
                                                  <span
                                                    key={sIdx}
                                                    className="px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-medium text-[#01164F]"
                                                  >
                                                    {size.size} × {size.quantity}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                              onClick={() => {
                                                const matchedColor = (selectedChoice.colors || []).find(
                                                  (color) => String(color.name || '').toLowerCase() === String(colorSel.colorName || '').toLowerCase(),
                                                );
                                                if (matchedColor) {
                                                  openSizingModal(slot.id, selectedChoice, matchedColor, slot.requiredQuantity, colorSel);
                                                }
                                              }}
                                              className="inline-flex items-center justify-center w-8 h-8 border border-[#CBD5E1] bg-white text-[#6B7380] hover:text-primary hover:border-primary rounded transition-colors"
                                              title="Edit"
                                              aria-label="Edit color selection"
                                            >
                                              <IoPencilOutline className="text-sm" />
                                            </button>
                                            <button
                                              onClick={() => removeColorSelection(slot.id, idx)}
                                              className="inline-flex items-center justify-center w-8 h-8 border border-[#CBD5E1] bg-white text-[#6B7380] hover:text-[#FF4D4F] hover:border-[#FF4D4F] rounded transition-colors"
                                              title="Delete"
                                              aria-label="Delete color selection"
                                            >
                                              <IoTrashOutline className="text-sm" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                              })}
                            </div>
                          )}

                          {(!selections[slot.id]?.colorSelections || selections[slot.id].colorSelections.length === 0) && (
                            <div className="p-4 bg-[#FFF8E1] border-t border-[#FFE8A3] text-center">
                              <p className="text-xs text-primary">
                                <i className="ri-information-line mr-1"></i>
                                Click on a color above to select sizes
                              </p>
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4"
          onClick={resetModal}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#CBD5E1] flex items-center justify-between bg-gradient-to-r from-[#F8F9FA] to-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: modal.color?.primaryHexCode || '#ccc' }}
                ></div>
                <h3 className="text-lg font-semibold text-[#01164F]">
                  {modal.color?.name}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-[#6B7380] block mb-1">Quantity Selected</span>
                  <span className={`text-lg font-bold ${
                    modalQty > 0 ? 'text-[#25B864]' : 'text-[#6B7380]'
                  }`}>
                    {modalQty}
                  </span>
                </div>
                <button onClick={resetModal} className="w-8 h-8 flex items-center justify-center text-[#6B7380] hover:text-[#01164F] hover:bg-gray-100 rounded-lg transition-colors">
                  <IoClose className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Product Image */}
              <div className="h-full max-h-[400px] bg-[#F8F9FA] rounded-xl overflow-hidden border border-[#CBD5E1] flex items-center justify-center">
                <img
                  src={modal.productImage || noimage}
                  alt={modal.color?.name || 'Selected product'}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Sizes List - Scrollable */}
              <div className="overflow-y-auto pr-2 space-y-3" style={{ maxHeight: '100%' }}>
                {modalSizes.length > 0 ? (
                  modalSizes.map((size) => {
                    const quantity = Number(modal.sizeQuantities?.[size] || 0);
                    const isSelected = quantity > 0;
                    return (
                      <div 
                        key={size}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          isSelected ? 'bg-blue-50 border-2 border-primary' : 'bg-[#F8F9FA] border border-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                            isSelected ? 'bg-primary text-white' : 'bg-white text-[#6B7380]'
                          }`}>
                            {size}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-[#01164F] block">
                              {size}
                            </span>
                            <p className="text-xs text-[#25B864]">
                              <i className="ri-check-line mr-1"></i>
                              100+ available
                            </p>
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleModalSizeChange(size, -1)}
                            disabled={quantity === 0}
                            className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] rounded-lg hover:border-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
                          >
                            <span className="text-lg font-bold">−</span>
                          </button>
                          <span className="w-10 text-center font-bold text-[#01164F]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleModalSizeChange(size, 1)}
                            disabled={modalQty >= modalGuard.maxAllowedInModal}
                            className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] rounded-lg hover:border-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
                          >
                            <span className="text-lg font-bold">+</span>
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#CBD5E1] flex justify-between items-center bg-[#F8F9FA] flex-shrink-0">
              <div className="text-sm text-[#6B7380]">
                <i className="ri-information-line mr-1"></i>
                Select the quantity for each size
              </div>
              <div className="flex gap-3">
                <button onClick={resetModal} className="px-6 py-2.5 border border-[#CBD5E1] rounded-lg font-semibold text-[#6B7380] hover:border-[#01164F] hover:text-[#01164F] transition-colors">
                  Cancel
                </button>
                <button onClick={confirmSelection} disabled={modalQty === 0} className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Add Selection
                </button>
              </div>
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
