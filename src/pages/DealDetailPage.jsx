import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoCheckmarkCircle, IoClose, IoInformationCircle } from 'react-icons/io5';
import { MdLocalOffer } from 'react-icons/md';
import { FaBoxOpen } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css';
import noimage from '/noimage.png';
import { findNearestColor, toProductUrl } from '@/utils/utils';
import { addToCart } from '@/redux/slices/cartSlice';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const roundToTwo = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

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
    color: null,
    selectedSize: '',
    selectedArtworkKey: '',
    selectedQuantity: 0,
  });

  const resetModal = () => {
    setModal({
      isOpen: false,
      slotId: null,
      productChoiceId: null,
      productKey: '',
      color: null,
      selectedSize: '',
      selectedArtworkKey: '',
      selectedQuantity: 0,
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
      if (!slot.isOptional && qty < slot.requiredQuantity) return false;
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

  const getAvailablePriceGroups = (productData) => {
    const priceGroups = productData?.product?.prices?.price_groups || [];
    const addons = productData?.product?.prices?.addons || [];

    const basePriceData = priceGroups.find((group) => group?.base_price)?.base_price;
    const baseGroup = basePriceData ? { ...basePriceData, type: 'base', key: 'base-none' } : null;

    const groupedAdditions = priceGroups.flatMap((group) =>
      (group?.additions || []).map((add) => ({ ...add, type: 'addition' })),
    );
    const standaloneAddons = addons.map((add) => ({ ...add, type: 'addition' }));
    const allAdditions = [...groupedAdditions, ...standaloneAddons].filter(Boolean);

    const dedupedAdditions = allAdditions.filter(
      (item, index, self) =>
        index === self.findIndex((other) => (other.key || other.description) === (item.key || item.description)),
    );

    return [baseGroup, ...dedupedAdditions].filter(Boolean);
  };

  const isNonArtworkAddition = (group) => {
    const decoration = String(group?.promodata_decoration || '').toLowerCase();
    const description = String(group?.description || '').toLowerCase();
    if (decoration.startsWith('addition:')) return true;

    const nonArtworkPatterns = [
      'polybag',
      'packaging',
      'surcharge',
      'metallic thread',
      'additional charge',
      'additional 5,000',
      'additional 5000',
    ];

    return nonArtworkPatterns.some((token) => description.includes(token) || decoration.includes(token));
  };

  const getArtworkOptions = (groups) => {
    const base = groups.find((group) => group.type === 'base');
    const output = [];
    if (base) output.push(base);

    const seen = new Set();
    groups.forEach((group) => {
      if (group.type !== 'addition') return;
      if (isNonArtworkAddition(group)) return;
      const optionKey = group.key || group.description || group.promodata_decoration;
      if (!optionKey || seen.has(optionKey)) return;
      seen.add(optionKey);
      output.push(group);
    });

    return output;
  };

  const getMethodUnitPrice = (qty, selectedMethod, baseBreaks = []) => {
    if (!selectedMethod) return 0;

    const methodBreaks = [...(selectedMethod.price_breaks || [])].sort((a, b) => a.qty - b.qty);
    let selectedBreak = methodBreaks[0] || { qty, price: 0 };
    for (let i = 0; i < methodBreaks.length; i += 1) {
      if (qty >= methodBreaks[i].qty) selectedBreak = methodBreaks[i];
    }

    if (selectedMethod.type === 'base') return Number(selectedBreak.price || 0);

    const sortedBase = [...baseBreaks].sort((a, b) => a.qty - b.qty);
    let basePrice = Number(sortedBase[0]?.price || 0);
    for (let i = 0; i < sortedBase.length; i += 1) {
      if (qty >= sortedBase[i].qty) basePrice = Number(sortedBase[i].price || 0);
    }

    return basePrice + Number(selectedBreak.price || 0);
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

  const openSizingModal = async (slotId, productChoice, color) => {
    const productData = await fetchSingleProduct(productChoice);
    const groups = getAvailablePriceGroups(productData);
    const artworkOptions = getArtworkOptions(groups);
    const selectedArtwork = artworkOptions[0] || null;

    const breaks = [...(selectedArtwork?.price_breaks || [])].sort((a, b) => a.qty - b.qty);
    const defaultQty = breaks[0]?.qty || 1;

    const modalSizes = resolveModalSizes(color, productData);

    setModal({
      isOpen: true,
      slotId,
      productChoiceId: productChoice.id,
      productKey: getProductKey(productChoice),
      color,
      selectedSize: modalSizes[0] || '',
      selectedArtworkKey: selectedArtwork?.key || '',
      selectedQuantity: defaultQty,
    });
  };

  const modalComputed = useMemo(() => {
    const modalProduct = modal.productKey ? productCache[modal.productKey] : null;
    const groups = getAvailablePriceGroups(modalProduct);
    const artworkOptions = getArtworkOptions(groups);
    const selectedArtwork = artworkOptions.find((opt) => opt.key === modal.selectedArtworkKey) || artworkOptions[0] || null;
    const baseBreaks = groups.find((g) => g.type === 'base')?.price_breaks || [];
    const priceBreaks = [...(selectedArtwork?.price_breaks || [])].sort((a, b) => a.qty - b.qty);

    const sizes = resolveModalSizes(modal.color, modalProduct);

    const qty = Number(modal.selectedQuantity || priceBreaks[0]?.qty || 0);
    const unit = getMethodUnitPrice(qty, selectedArtwork, baseBreaks);

    return {
      modalProduct,
      groups,
      artworkOptions,
      selectedArtwork,
      baseBreaks,
      priceBreaks,
      sizes,
      qty,
      unit,
      total: unit * qty,
    };
  }, [modal, productCache]);

  const confirmSelection = () => {
    const colorName = modal.color?.name || 'Selected Color';
    const qty = Number(modal.selectedQuantity || 0);
    if (qty <= 0) return;

    const selectedArtworkLabel =
      modalComputed.selectedArtwork?.type === 'base'
        ? 'None'
        : (modalComputed.selectedArtwork?.description || modalComputed.selectedArtwork?.promodata_decoration || 'Artwork');

    const colorHex =
      modal.color?.hexCode ||
      findNearestColor(String(colorName).split('/')[0]?.trim())?.hex ||
      '#9ca3af';

    setSelections((prev) => {
      const slotSelections = { ...prev[modal.slotId] };
      const existingIndex = slotSelections.colorSelections?.findIndex((item) => item.colorName === colorName) ?? -1;

      const newColorSelection = {
        colorName,
        colorHex,
        quantity: qty,
        quantityTier: qty,
        size: modal.selectedSize || '',
        artwork: selectedArtworkLabel,
        unitPrice: modalComputed.unit,
        totalPrice: modalComputed.total,
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

  const handleRequestQuote = () => {
    if (!areSelectionsComplete()) {
      toast.error('Please complete all required deal selections before requesting a quote.');
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
      const groups = getAvailablePriceGroups(cached);
      const basePrices = groups.find((g) => g.type === 'base')?.price_breaks || [];
      const productImage = getImageUrl(selectedChoice.images?.[0]?.url);
      const colorSelections = selections?.[slot.id]?.colorSelections || [];

      colorSelections.forEach((colorSel) => {
        const qty = Number(colorSel.quantity || 0);
        const unitPrice = Number(colorSel.unitPrice || 0);
        if (qty <= 0) return;

        preparedLines.push({
          slot,
          selectedChoice,
          basePrices,
          productImage,
          colorSel,
          qty,
          rawUnitPrice: unitPrice,
          rawLineTotal: roundToTwo(unitPrice * qty),
        });
      });
    });

    if (preparedLines.length === 0) {
      toast.error('No valid selections were found to request a quote.');
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

    const savingsPerBundle = roundToTwo(
      Number(deal?.savingsAmount || 0) > 0
        ? Number(deal.savingsAmount)
        : Math.max(Number(deal?.basePrice || 0) - Number(deal?.dealPrice || 0), 0),
    );

    const totalBundleSavings = roundToTwo(Math.max(eligibleBundles * savingsPerBundle, 0));
    const dealDiscountAmount = roundToTwo(Math.min(totalBundleSavings, rawSubtotal));
    const adjustedSubtotalTarget = roundToTwo(rawSubtotal - dealDiscountAmount);
    const shouldApplyDealDiscount = dealDiscountAmount > 0 && rawSubtotal > 0;
    let runningAdjustedTotal = 0;
    const requestTimestamp = Date.now();

    preparedLines.forEach((line, index) => {
      let adjustedLineTotal = line.rawLineTotal;

      if (shouldApplyDealDiscount) {
        if (index === preparedLines.length - 1) {
          adjustedLineTotal = roundToTwo(adjustedSubtotalTarget - runningAdjustedTotal);
        } else {
          const proportional = (line.rawLineTotal / rawSubtotal) * adjustedSubtotalTarget;
          adjustedLineTotal = roundToTwo(proportional);
          runningAdjustedTotal = roundToTwo(runningAdjustedTotal + adjustedLineTotal);
        }
      }

      const adjustedUnitPrice = line.qty > 0 ? adjustedLineTotal / line.qty : line.rawUnitPrice;
      const lineDiscountAmount = roundToTwo(Math.max(line.rawLineTotal - adjustedLineTotal, 0));

      dispatch(
        addToCart({
          id: String(line.selectedChoice.product.id || line.selectedChoice.product.code || line.selectedChoice.product.name),
          name: line.selectedChoice.product.name || line.slot.slotName || 'Deal Item',
          code: line.selectedChoice.product.code,
          image: line.productImage,
          basePrices: line.basePrices,
          price: adjustedUnitPrice,
          totalPrice: adjustedLineTotal,
          quantity: line.qty,
          size: line.colorSel.size || '',
          color: line.colorSel.colorName || '',
          print: line.colorSel.artwork || 'None',
          printMethodKey: `${line.colorSel.artwork || 'none'}::deal::${deal.id}::${line.slot.id}::${line.colorSel.colorName || 'color'}::${line.colorSel.size || 'size'}::${requestTimestamp}::${index}`,
          setupFee: 0,
          freightFee: 0,
          sample: false,
          userEmail,
          rawUnitPrice: line.rawUnitPrice,
          rawLineTotal: line.rawLineTotal,
          lineDealDiscountAmount: lineDiscountAmount,
          dealSource: {
            dealId: deal.id,
            dealCode: deal.dealCode,
            dealTitle: deal.title,
            slotId: line.slot.id,
          },
        }),
      );
    });

    const estimatedCartTotal = shouldApplyDealDiscount ? adjustedSubtotalTarget : rawSubtotal;

    const quoteData = {
      type: 'deal',
      dealId: deal.id,
      dealCode: deal.dealCode,
      dealTitle: deal.title,
      selections,
      totalItems: getTotalItems(),
      estimatedPrice: deal.dealPrice,
      estimatedSavings: deal.savingsAmount,
      rawSubtotal,
      appliedDealTotal: estimatedCartTotal,
      appliedDealDiscountAmount: dealDiscountAmount,
      appliedBundleCount: eligibleBundles,
      savingsPerBundle,
    };

    sessionStorage.setItem('dealQuoteData', JSON.stringify(quoteData));
    navigate('/upload-artwork', {
      state: {
        fromDeal: true,
        dealData: quoteData,
        cartTotal: estimatedCartTotal,
        dealDiscountAmount,
        rawDealSubtotal: rawSubtotal,
        couponDiscount: 0,
        shippingCharges: 0,
        setupFee: 0,
      },
    });
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="relative aspect-[4/3]">
                <img src={getImageUrl(deal.bannerImage)} alt={deal.title} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.title}</h1>
              <p className="text-sm text-gray-500 mb-4">Deal Code: {deal.dealCode}</p>
              {deal.description && <p className="text-gray-700 leading-relaxed mb-6">{deal.description}</p>}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaBoxOpen className="text-primary" />
                  What's Included:
                </h3>
                <div className="space-y-2">
                  {deal.productSlots?.map((slot) => (
                    <div key={slot.id} className="flex items-start gap-2">
                      <IoCheckmarkCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {slot.requiredQuantity}x {slot.slotName}
                        {slot.hasCustomization && <span className="text-primary ml-1">(Customization available)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MdLocalOffer className="text-2xl" />
                Request Your Quote
              </h3>

              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm opacity-90">Your Selection:</span>
                  <span className="font-bold">{totalItems} items selected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Progress:</span>
                  <span className={`font-semibold ${isComplete ? 'text-green-300' : 'text-yellow-300'}`}>
                    {isComplete ? 'Complete' : 'In Progress'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleRequestQuote}
                className="w-full py-4 bg-white text-teal-700 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all"
              >
                Get Custom Quote
              </button>
            </div>
          </div>

          <div className="space-y-6">
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
                      <li>3. Choose artwork, size and quantity tier in modal</li>
                      <li>4. Confirm selection and request quote</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {deal.productSlots?.map((slot, slotIndex) => {
                  const selectedChoice = getProductChoice(slot);
                  const totalQty = getSlotTotalQuantity(slot.id);
                  const progress = `${totalQty}/${slot.requiredQuantity}`;
                  const isSlotComplete = slot.isOptional || totalQty >= slot.requiredQuantity;

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
                          <p className="text-xs text-gray-500 mb-3">Click a color to open artwork, size and pricing tiers</p>

                          <div className="flex flex-wrap gap-3 mb-3">
                            {(selectedChoice.colors || []).map((colorItem, idx) => {
                              const colorName = colorItem.name;
                              const isSelected = selections[slot.id]?.colorSelections?.some((cs) => cs.colorName === colorName);
                              return (
                                <button
                                  key={`${colorName}-${idx}`}
                                  onClick={() => openSizingModal(slot.id, selectedChoice, colorItem)}
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
                                <div key={idx} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-xs">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ backgroundColor: colorSel.colorHex || '#9ca3af' }} />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 truncate">{colorSel.colorName}</p>
                                      <p className="text-gray-600">Qty: <span className="font-bold text-primary">{colorSel.quantity}</span></p>
                                      {colorSel.size && <p className="text-gray-600">Size: <span className="font-bold">{colorSel.size}</span></p>}
                                      {colorSel.artwork && <p className="text-gray-600">Artwork: <span className="font-bold">{colorSel.artwork}</span></p>}
                                      {typeof colorSel.unitPrice === 'number' && <p className="text-gray-600">Unit: <span className="font-bold">A${colorSel.unitPrice.toFixed(2)}</span></p>}
                                    </div>
                                  </div>
                                  <button onClick={() => removeColorSelection(slot.id, idx)} className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0" title="Remove this color">
                                    <IoClose className="text-lg" />
                                  </button>
                                </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex-1">
                <h3 className="text-xl font-bold">Select Quantity and Size</h3>
                <p className="text-sm opacity-90 mt-1">Color: {modal.color?.name}</p>
              </div>
              <button onClick={resetModal} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border-b bg-gray-50">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Artwork</label>
                <select
                  value={modal.selectedArtworkKey}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const selected = modalComputed.artworkOptions.find((o) => o.key === newKey) || modalComputed.artworkOptions[0] || null;
                    const breaks = [...(selected?.price_breaks || [])].sort((a, b) => a.qty - b.qty);
                    setModal((prev) => ({
                      ...prev,
                      selectedArtworkKey: newKey,
                      selectedQuantity: breaks[0]?.qty || prev.selectedQuantity,
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-md outline-none"
                >
                  {modalComputed.artworkOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.type === 'base' ? 'None' : option.description || option.promodata_decoration || 'Artwork'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Size</label>
                <select
                  value={modal.selectedSize}
                  onChange={(e) => setModal((prev) => ({ ...prev, selectedSize: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md outline-none"
                >
                  {modalComputed.sizes.length > 0 ? (
                    modalComputed.sizes.map((size, idx) => (
                      <option key={`${size}-${idx}`} value={size}>{size}</option>
                    ))
                  ) : (
                    <option value="">Standard</option>
                  )}
                </select>
              </div>
            </div>

            <div className="p-6">
              {loadingProductKey === modal.productKey && !modalComputed.modalProduct ? (
                <div className="py-8 text-center text-gray-500 text-sm">Loading pricing and size data...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Select</th>
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Qty</th>
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit (ex GST)</th>
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalComputed.priceBreaks.length > 0 ? (
                          modalComputed.priceBreaks.map((priceBreak, idx) => {
                            const qty = Number(priceBreak.qty || 0);
                            const unit = getMethodUnitPrice(qty, modalComputed.selectedArtwork, modalComputed.baseBreaks);
                            const total = unit * qty;
                            const isSelected = Number(modal.selectedQuantity) === qty;
                            const isMinQty = idx === 0 && qty < 25;

                            return (
                              <tr key={`${qty}-${idx}`} className={`${isSelected ? 'bg-blue-50 border-2 border-primary' : 'hover:bg-gray-50'} ${isMinQty ? 'bg-yellow-50' : ''}`}>
                                <td className="border border-gray-300 px-4 py-3 text-center">
                                  <input
                                    type="radio"
                                    name="quantityTier"
                                    checked={isSelected}
                                    onChange={() => setModal((prev) => ({ ...prev, selectedQuantity: qty }))}
                                    className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                                  />
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">
                                  {qty}+
                                  {isMinQty && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">For Low MOQ, Contact Us</span>}
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">${unit.toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900">${total.toFixed(2)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                              No pricing tiers available for this artwork method
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-100 flex items-center justify-between text-sm">
                    <span className="text-gray-700">Selected Tier Total</span>
                    <span className="font-bold text-primary">A${modalComputed.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">See size guide on product page for full measurements</p>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t-2 p-4 flex gap-3 rounded-b-2xl">
              <button onClick={resetModal} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={confirmSelection} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <IoCheckmarkCircle className="text-xl" />
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealDetailPage;
