import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, ChevronRight, ImagePlus, PencilLine, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';

const METHOD_FALLBACK_CONFIG = {
  EMBROIDERY: {
    name: 'Embroidery',
    description: 'Premium embroidered logos for a clean and durable finish',
  },
  PRINTING: {
    name: 'Screen Printing',
    description: 'High-quality printed branding for detailed artwork',
  },
};

const TYPE_FALLBACK_CONFIG = {
  IMAGE: {
    name: 'Logo/Image Upload',
    description: 'Upload a logo or artwork file',
  },
  TEXT: {
    name: 'Text Only',
    description: 'Add a custom message or business name',
  },
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DealCustomizationModal({
  isOpen,
  onClose,
  onComplete,
  slots = [],
  initialCustomizations = {},
}) {
  const fileInputRef = useRef(null);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState(null);
  const [slotsData, setSlotsData] = useState({});
  const [slotCustomizations, setSlotCustomizations] = useState({});
  const [slotProgress, setSlotProgress] = useState({});
  const [configStep, setConfigStep] = useState('method');
  const [selectedMethodType, setSelectedMethodType] = useState(null);
  const [selectedApplicationType, setSelectedApplicationType] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [textValue, setTextValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentSlot = slots[currentSlotIndex] || null;
  const currentSlotData = currentSlot ? slotsData[currentSlot.selectedProductId] || null : null;

  const selectedProductId = currentSlot?.selectedProductId || null;

  const uniqueMethodTypes = useMemo(() => {
    const methods = currentSlotData?.methods || [];
    const methodMap = new Map();

    methods.forEach((method) => {
      if (!methodMap.has(method.applicationMethod)) {
        const fallback = METHOD_FALLBACK_CONFIG[method.applicationMethod] || {};
        methodMap.set(method.applicationMethod, {
          type: method.applicationMethod,
          name: fallback.name || method.applicationMethod,
          description: fallback.description || '',
          applicationTypes: [],
          methods: [],
        });
      }
      const entry = methodMap.get(method.applicationMethod);
      if (!entry.applicationTypes.includes(method.applicationType)) {
        entry.applicationTypes.push(method.applicationType);
      }
      entry.methods.push(method);
    });

    return Array.from(methodMap.values());
  }, [currentSlotData]);

  const availableApplicationTypes = useMemo(() => {
    if (!selectedMethodType) return [];
    const methodEntry = uniqueMethodTypes.find((method) => method.type === selectedMethodType);
    if (!methodEntry) return [];

    return methodEntry.applicationTypes.map((type) => {
      const fallback = TYPE_FALLBACK_CONFIG[type] || {};
      const methodRecord = (currentSlotData?.methods || []).find(
        (method) => method.applicationMethod === selectedMethodType && method.applicationType === type,
      );

      return {
        id: type,
        name: methodRecord?.typeDisplayName || fallback.name || type,
        description: methodRecord?.typeDescription || fallback.description || '',
      };
    });
  }, [currentSlotData, selectedMethodType, uniqueMethodTypes]);

  const selectedMethod = useMemo(() => {
    if (!selectedMethodType || !selectedApplicationType) return null;
    return (currentSlotData?.methods || []).find(
      (method) =>
        method.applicationMethod === selectedMethodType &&
        method.applicationType === selectedApplicationType,
    );
  }, [currentSlotData, selectedMethodType, selectedApplicationType]);

  const selectedPositionIds = useMemo(() => new Set(selectedPositions.map((position) => position._id || position.id)), [selectedPositions]);

  const availablePositions = useMemo(() => {
    if (!selectedMethod) return [];
    const positions = currentSlotData?.positions || [];
    const filtered = positions.filter(
      (position) =>
        position.methodId === selectedMethod.id ||
        position.methodId === null ||
        position.methodId === undefined,
    );
    return filtered.length > 0 ? filtered : positions;
  }, [currentSlotData, selectedMethod]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentSlotIndex(0);
    setShowReview(false);
    setError(null);
    setIsLoadingOptions(false);
    setConfigStep('method');
    setSelectedMethodType(null);
    setSelectedApplicationType(null);
    setSelectedPositions([]);
    setTextValue('');
    setUploadedFile(null);
    setUploadedImageUrl(null);
    setUploadedFilePreview(null);
    setSlotProgress({});
    setSlotCustomizations(initialCustomizations || {});
  }, [isOpen, initialCustomizations]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!isOpen || !selectedProductId) return;

      setIsLoadingOptions(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/api/product-customizations/${selectedProductId}`);
        const data = await response.json();
        if (response.ok && data.success) {
          const methods = (data.data || []).map((itemRow) => ({
            id: itemRow.method?._id,
            applicationMethod: itemRow.method?.applicationMethod,
            applicationType: itemRow.method?.applicationType,
            setupCharge: itemRow.method?.setupCharge,
          }));
          const positions = (data.data || []).flatMap((itemRow) => (itemRow.positions || []).map((position) => ({
            ...position,
            _id: position._id || position.id,
          })));

          setSlotsData((prev) => ({
            ...prev,
            [selectedProductId]: {
              methods,
              positions,
            },
          }));
        } else {
          setError(data?.message || 'Failed to load customization options');
        }
      } catch (err) {
        console.error('Failed to load customization options', err);
        setError('Failed to load customization options');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen, selectedProductId]);

  const saveCurrentSlotCustomization = () => {
    if (!currentSlot) return false;
    if (!selectedMethod || !selectedApplicationType || selectedPositions.length === 0) return false;

    const hasText = selectedApplicationType === 'TEXT' ? textValue.trim().length > 0 : true;
    const hasImage = selectedApplicationType === 'IMAGE' ? Boolean(uploadedImageUrl) : true;
    if (!hasText || !hasImage) return false;

    const customizationFile = uploadedImageUrl
      ? {
          preview: uploadedImageUrl,
          name: uploadedFile?.name || 'Uploaded logo',
          type: uploadedFile?.type || 'image/*',
        }
      : null;

    const customization = {
      slotId: currentSlot.slotId,
      slotName: currentSlot.slotName,
      productId: currentSlot.selectedProductId,
      productName: currentSlot.selectedProductName,
      productImage: currentSlot.selectedProductImage,
      quantity: currentSlot.selectedQuantity,
      method: {
        id: selectedMethod.id,
        applicationMethod: selectedMethod.applicationMethod,
        applicationType: selectedMethod.applicationType,
        setupCharge: Number(selectedMethod.setupCharge || 0),
      },
      positions: selectedPositions.map((position) => ({
        id: position._id || position.id,
        positionName: position.positionName,
        positionCode: position.positionCode,
        priceAdjustment: Number(position.priceAdjustment || 0),
      })),
      content: selectedApplicationType === 'TEXT'
        ? { type: 'TEXT', text: textValue }
        : { type: 'IMAGE', imageUrl: uploadedImageUrl },
      customizationFile,
    };

    setSlotCustomizations((prev) => ({
      ...prev,
      [currentSlot.slotId]: customization,
    }));

    return true;
  };

  const handleSlotChange = (index) => {
    if (currentSlot) {
      const currentSlotId = currentSlot.slotId;
      const hasDraft = selectedMethodType || selectedApplicationType || selectedPositions.length > 0 || textValue || uploadedImageUrl;
      if (hasDraft) {
        setSlotProgress((prev) => ({
          ...prev,
          [currentSlotId]: {
            configStep,
            selectedMethodType,
            selectedApplicationType,
            selectedPositions,
            textValue,
            uploadedImageUrl,
            uploadedFile,
            uploadedFilePreview,
          },
        }));
      }
    }

    setCurrentSlotIndex(index);

    const targetSlot = slots[index];
    const saved = targetSlot ? slotCustomizations[targetSlot.slotId] : null;
    if (saved) {
      setSelectedMethodType(saved.method?.applicationMethod || null);
      setSelectedApplicationType(saved.method?.applicationType || null);
      setSelectedPositions(saved.positions || []);
      setTextValue(saved.content?.text || '');
      setUploadedImageUrl(saved.content?.imageUrl || null);
      setConfigStep('content');
      return;
    }

    const progress = targetSlot ? slotProgress[targetSlot.slotId] : null;
    if (progress) {
      setConfigStep(progress.configStep || 'method');
      setSelectedMethodType(progress.selectedMethodType || null);
      setSelectedApplicationType(progress.selectedApplicationType || null);
      setSelectedPositions(progress.selectedPositions || []);
      setTextValue(progress.textValue || '');
      setUploadedImageUrl(progress.uploadedImageUrl || null);
      setUploadedFile(progress.uploadedFile || null);
      setUploadedFilePreview(progress.uploadedFilePreview || null);
      return;
    }

    setConfigStep('method');
    setSelectedMethodType(null);
    setSelectedApplicationType(null);
    setSelectedPositions([]);
    setTextValue('');
    setUploadedImageUrl(null);
    setUploadedFile(null);
    setUploadedFilePreview(null);
  };

  const handlePastLogoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(`${BACKEND_URL}/api/checkout/upload-logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: base64 }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Logo upload failed');
      }

      const uploadedUrl = data?.data?.logo || data?.data?.logoUrl || data?.data?.url || null;
      setUploadedImageUrl(uploadedUrl);
      setUploadedFile(file);
      setUploadedFilePreview(base64);
    } catch (err) {
      console.error(err);
      toast.error('Logo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const isCurrentStepComplete = Boolean(
    selectedMethod &&
      selectedApplicationType &&
      selectedPositions.length > 0 &&
      ((selectedApplicationType === 'TEXT' && textValue.trim()) || (selectedApplicationType === 'IMAGE' && uploadedImageUrl)),
  );

  const handleComplete = () => {
    const customizedSlots = Object.values(slotCustomizations);
    onComplete({
      dealCustomizations: customizedSlots,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customize Your Bundle</h2>
              <p className="text-sm text-gray-500">Add logo and personalisation to your selected deal slots</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-0">
            <aside className="border-r border-gray-200 bg-gray-50 min-h-0 overflow-y-auto">
              <div className="px-5 py-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Product Slots</p>
                <p className="text-xs text-gray-500 mt-1">{Object.keys(slotCustomizations).length} of {slots.length} customized</p>
              </div>
              <div>
                {slots.map((slot, index) => {
                  const isActive = index === currentSlotIndex;
                  const isDone = Boolean(slotCustomizations[slot.slotId]);
                  return (
                    <button
                      key={slot.slotId}
                      onClick={() => handleSlotChange(index)}
                      className={`w-full text-left px-5 py-4 border-b border-gray-200 transition-colors ${isActive ? 'bg-white' : 'hover:bg-white/70'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {slot.selectedProductImage ? (
                            <img src={slot.selectedProductImage} alt={slot.slotName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{slot.slotName}</p>
                            {isDone && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{slot.selectedProductName}</p>
                          <p className="text-xs text-gray-500">Qty: {slot.selectedQuantity}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <main className="min-h-0 flex flex-col">
              {!showReview && currentSlot && (
                <>
                  <div className="px-5 sm:px-6 py-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className={configStep === 'method' ? 'font-semibold text-primary' : ''}>Method</span>
                      <ChevronRight className="w-4 h-4" />
                      <span className={configStep === 'appType' ? 'font-semibold text-primary' : ''}>Type</span>
                      <ChevronRight className="w-4 h-4" />
                      <span className={configStep === 'position' ? 'font-semibold text-primary' : ''}>Position</span>
                      <ChevronRight className="w-4 h-4" />
                      <span className={configStep === 'content' ? 'font-semibold text-primary' : ''}>Content</span>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
                    {error && (
                      <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                        {error}
                      </div>
                    )}

                    {isLoadingOptions ? (
                      <div className="h-full flex items-center justify-center py-20 text-gray-500">
                        Loading customization options...
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            {configStep === 'method' && 'Select Customization Method'}
                            {configStep === 'appType' && 'Select Application Type'}
                            {configStep === 'position' && 'Select Position(s)'}
                            {configStep === 'content' && 'Upload Your Design'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{currentSlot.slotName}</p>
                        </div>

                        {configStep === 'method' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {uniqueMethodTypes.map((method) => (
                              <button
                                key={method.type}
                                onClick={() => {
                                  setSelectedMethodType(method.type);
                                  setSelectedApplicationType(null);
                                  setSelectedPositions([]);
                                  setConfigStep('appType');
                                }}
                                className="text-left rounded-2xl border border-gray-200 p-5 hover:border-[#F3B11A] hover:shadow-md transition-all bg-white"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] mb-4 flex items-center justify-center text-gray-900 font-bold">
                                  {method.type?.[0] || 'M'}
                                </div>
                                <div className="font-semibold text-gray-900 mb-1">{method.name}</div>
                                <p className="text-sm text-gray-500">{method.description}</p>
                              </button>
                            ))}
                          </div>
                        )}

                        {configStep === 'appType' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableApplicationTypes.map((type) => (
                              <button
                                key={type.id}
                                onClick={() => {
                                  setSelectedApplicationType(type.id);
                                  setSelectedPositions([]);
                                  setConfigStep('position');
                                }}
                                className="text-left rounded-2xl border border-gray-200 p-5 hover:border-[#F3B11A] hover:shadow-md transition-all bg-white"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] mb-4 flex items-center justify-center text-gray-900 font-bold">
                                  {type.id === 'TEXT' ? <PencilLine className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />}
                                </div>
                                <div className="font-semibold text-gray-900 mb-1">{type.name}</div>
                                <p className="text-sm text-gray-500">{type.description}</p>
                              </button>
                            ))}
                          </div>
                        )}

                        {configStep === 'position' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {availablePositions.map((position) => {
                                const isSelected = selectedPositionIds.has(position._id || position.id);
                                return (
                                  <button
                                    key={position._id || position.id}
                                    onClick={() => {
                                      setSelectedPositions((prev) => {
                                        const exists = prev.find((item) => (item._id || item.id) === (position._id || position.id));
                                        if (exists) {
                                          return prev.filter((item) => (item._id || item.id) !== (position._id || position.id));
                                        }
                                        return [...prev, position];
                                      });
                                    }}
                                    className={`rounded-2xl border p-5 text-left transition-all bg-white ${isSelected ? 'border-[#F3B11A] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                                  >
                                    <div className="font-semibold text-gray-900 mb-1">{position.positionName}</div>
                                    <p className="text-xs text-gray-500">{position.positionCode || 'Position'}</p>
                                    {Number(position.priceAdjustment || 0) > 0 && (
                                      <p className="text-xs text-primary mt-2">+${Number(position.priceAdjustment).toFixed(2)}</p>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {configStep === 'content' && (
                          <div className="space-y-5">
                            {selectedApplicationType === 'TEXT' ? (
                              <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">Text</label>
                                <textarea
                                  value={textValue}
                                  onChange={(e) => setTextValue(e.target.value)}
                                  rows={6}
                                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-[#F3B11A]"
                                  placeholder="Enter your personalization text"
                                />
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {uploadedImageUrl ? (
                                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-emerald-800 truncate">Logo uploaded successfully</p>
                                          <p className="text-xs text-emerald-700 truncate">{uploadedFile?.name || 'Uploaded logo'}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setUploadedImageUrl(null);
                                          setUploadedFile(null);
                                          setUploadedFilePreview(null);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    {uploadedFilePreview && (
                                      <div className="mt-4 rounded-2xl overflow-hidden bg-white border border-emerald-100">
                                        <img src={uploadedFilePreview} alt="Logo preview" className="w-full max-h-64 object-contain" />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center hover:border-[#F3B11A] hover:bg-[#FFF9E6] transition-colors"
                                  >
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                                    <p className="font-semibold text-gray-900">Click to upload logo or artwork</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG, or PDF</p>
                                  </button>
                                )}
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handlePastLogoUpload(file);
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 px-5 sm:px-6 py-4 bg-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onClose}
                        className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const saved = saveCurrentSlotCustomization();
                          if (!saved) {
                            toast.error('Complete the current customization before continuing');
                            return;
                          }
                          if (currentSlotIndex < slots.length - 1) {
                            handleSlotChange(currentSlotIndex + 1);
                          } else {
                            setShowReview(true);
                          }
                        }}
                        disabled={!isCurrentStepComplete}
                        className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentSlotIndex < slots.length - 1 ? 'Save & Next' : 'Review Customizations'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showReview && (
                <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Review Customizations</h3>
                      <p className="text-sm text-gray-500">Check your logo and personalization before adding to cart</p>
                    </div>

                    <div className="space-y-3">
                      {Object.values(slotCustomizations).map((customization) => (
                        <div key={customization.slotId} className="rounded-2xl border border-gray-200 p-4 bg-white">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{customization.slotName}</p>
                              <p className="text-xs text-gray-500">{customization.method.applicationMethod} • {customization.method.applicationType}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {customization.positions.map((position) => position.positionName).join(', ')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleSlotChange(slots.findIndex((slot) => slot.slotId === customization.slotId))}
                              className="text-sm text-primary hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-primary text-white p-5">
                      <p className="text-sm opacity-80">Your customization choices will be applied to the deal items in cart.</p>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>

          {showReview && (
            <div className="border-t border-gray-200 px-5 sm:px-6 py-4 bg-white flex items-center justify-between gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                Confirm & Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

DealCustomizationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  slots: PropTypes.array,
  initialCustomizations: PropTypes.object,
};