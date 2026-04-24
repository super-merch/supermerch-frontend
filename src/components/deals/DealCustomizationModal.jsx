import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardCheck, 
  ImagePlus, 
  MapPin, 
  Palette, 
  PencilLine, 
  Sparkles, 
  Trash2, 
  Upload, 
  X,
  CheckCircle2,
  AlertCircle,
  Layout,
  Type,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

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
        methodMap.set(method.applicationMethod, {
          type: method.applicationMethod,
          name: method.displayName || method.applicationMethod,
          description: method.description || '',
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
      const methodRecord = (currentSlotData?.methods || []).find(
        (method) => method.applicationMethod === selectedMethodType && method.applicationType === type,
      );

      return {
        id: type,
        name: methodRecord?.displayName || type,
        description: methodRecord?.description || '',
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
          const uniquePositions = [];
          const seenPositionIds = new Set();
          
          (data.data || []).forEach((itemRow) => {
            (itemRow.positions || []).forEach((pos) => {
              const posId = pos._id || pos.id;
              if (!seenPositionIds.has(posId)) {
                uniquePositions.push({
                  ...pos,
                  _id: posId,
                });
                seenPositionIds.add(posId);
              }
            });
          });

          setSlotsData((prev) => ({
            ...prev,
            [selectedProductId]: {
              methods,
              positions: uniquePositions,
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
        imageUrl: position.imageUrl,
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
    setShowReview(false);
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

  const handleMethodTypeSelect = (type) => {
    setSelectedMethodType(type);
    setSelectedApplicationType(null);
    setConfigStep('appType');
  };

  const handleApplicationTypeSelect = (typeId) => {
    setSelectedApplicationType(typeId);
    setConfigStep('position');
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

  const modalContent = (
    <div className="fixed inset-0 z-[10001] overflow-hidden flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E8ECF2] bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#009688]/5 flex items-center justify-center">
              <Palette className="text-[#009688] w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#009688]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {showReview ? 'Review Customizations' : 'Customize Your Bundle'}
              </h2>
              <p className="text-sm text-[#6B7380] font-medium">Configure decorations for each item in your deal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[#6B7380] hover:text-[#009688] hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Slot Selection */}
          <div className="w-1/3 sm:w-1/4 border-r border-[#E8ECF2] bg-[#F8F9FA] flex flex-col">
            <div className="p-4 border-b border-[#E8ECF2] bg-white">
              <h3 className="text-[10px] font-bold text-[#6B7380] uppercase tracking-[0.1em]">Bundle Items</h3>
              <p className="text-[10px] text-gray-500 mt-1">
                {Object.keys(slotCustomizations).length} of {slots.length} configured
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {slots.map((slot, index) => {
                const isSelected = index === currentSlotIndex;
                const isDone = !!slotCustomizations[slot.slotId];

                return (
                  <button
                    key={slot.slotId}
                    onClick={() => handleSlotChange(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-white border-[#009688] shadow-sm ring-1 ring-[#009688]'
                        : isDone
                        ? 'bg-white border-green-200 hover:border-green-300'
                        : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                        {slot.selectedProductImage ? (
                          <img
                            src={slot.selectedProductImage}
                            alt={slot.slotName}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                            <Sparkles size={20} />
                          </div>
                        )}
                        {isDone && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Check className="text-white w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate uppercase tracking-wider ${isSelected ? 'text-[#009688]' : 'text-gray-900'}`}>
                          {slot.slotName}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {slot.selectedProductName}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Configuration Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            {!showReview && currentSlot && (
              <>
                {/* Step Progress */}
                <div className="px-6 py-4 border-b border-[#E8ECF2] bg-white shrink-0">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {[
                      { id: 'method', label: 'Method', icon: Palette },
                      { id: 'appType', label: 'Type', icon: PencilLine },
                      { id: 'position', label: 'Position', icon: MapPin },
                      { id: 'content', label: 'Content', icon: Upload },
                    ].map((step, idx) => {
                      const stepIndex = ['method', 'appType', 'position', 'content'].indexOf(step.id);
                      const currentIndex = ['method', 'appType', 'position', 'content'].indexOf(configStep);
                      const isCompleted = stepIndex < currentIndex;
                      const isActive = step.id === configStep;

                      return (
                        <div key={step.id} className="flex items-center group">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : isActive
                                  ? 'bg-[#009688] border-[#009688] text-white shadow-lg shadow-[#009688]/20'
                                  : 'bg-white border-gray-200 text-gray-400'
                              }`}
                            >
                              {isCompleted ? <Check size={18} /> : <step.icon size={18} />}
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest ${
                                isActive ? 'text-[#009688]' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          {idx < 3 && (
                            <div className="w-12 sm:w-20 h-[2px] mx-2 mb-6 bg-gray-100">
                              <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: isCompleted ? '100%' : '0%' }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-6 sm:p-8">
                    <div className="max-w-4xl mx-auto">
                      {error && (
                        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                          <AlertCircle size={20} />
                          <p className="text-sm font-medium">{error}</p>
                        </div>
                      )}

                      {isLoadingOptions ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="w-12 h-12 border-4 border-[#009688] border-t-transparent rounded-full animate-spin mb-4" />
                          <p className="text-gray-500 font-medium">Loading options...</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <div className="text-center sm:text-left">
                            <h3 className="text-2xl font-bold text-[#009688]">
                              {configStep === 'method' && 'Select Customization Method'}
                              {configStep === 'appType' && 'Select Application Type'}
                              {configStep === 'position' && 'Select Position(s)'}
                              {configStep === 'content' && 'Upload Your Design'}
                            </h3>
                            <p className="text-sm text-[#6B7380] mt-1 font-medium">
                              Configuring: <span className="text-[#009688] font-bold">{currentSlot.slotName}</span>
                            </p>
                          </div>

                          {configStep === 'method' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {uniqueMethodTypes.map((method) => (
                                <button
                                  key={method.type}
                                  onClick={() => handleMethodTypeSelect(method.type)}
                                  className="group relative text-left rounded-2xl border-2 border-[#E8ECF2] p-6 hover:border-[#009688] hover:shadow-2xl transition-all duration-300 bg-white"
                                >
                                  <div className="w-14 h-14 rounded-2xl bg-[#F8F9FA] mb-4 flex items-center justify-center group-hover:bg-[#009688]/5 transition-colors">
                                    <Palette className="w-7 h-7 text-[#6B7380] group-hover:text-[#009688]" />
                                  </div>
                                  <h4 className="font-bold text-lg text-[#009688] mb-1">{method.name}</h4>
                                  <p className="text-sm text-[#6B7380] leading-relaxed">{method.description}</p>
                                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-[#009688] flex items-center justify-center shadow-lg shadow-[#009688]/20">
                                      <ChevronRight className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {configStep === 'appType' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {availableApplicationTypes.map((type) => (
                                <button
                                  key={type.id}
                                  onClick={() => handleApplicationTypeSelect(type.id)}
                                  className="group relative text-left rounded-2xl border-2 border-[#E8ECF2] p-6 hover:border-[#009688] hover:shadow-2xl transition-all duration-300 bg-white"
                                >
                                  <div className="w-14 h-14 rounded-2xl bg-[#F8F9FA] mb-4 flex items-center justify-center group-hover:bg-[#009688]/5 transition-colors">
                                    {type.id === 'TEXT' ? (
                                      <Type className="w-7 h-7 text-[#6B7380] group-hover:text-[#009688]" />
                                    ) : (
                                      <ImagePlus className="w-7 h-7 text-[#6B7380] group-hover:text-[#009688]" />
                                    )}
                                  </div>
                                  <h4 className="font-bold text-lg text-[#009688] mb-1">{type.name}</h4>
                                  <p className="text-sm text-[#6B7380] leading-relaxed">{type.description}</p>
                                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-[#009688] flex items-center justify-center shadow-lg shadow-[#009688]/20">
                                      <ChevronRight className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {configStep === 'position' && (
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availablePositions.map((position) => {
                                  const isSelected = selectedPositionIds.has(position._id || position.id);
                                  const positionCode = position.positionCode?.toLowerCase() || '';
                                  let mockupQuery = `Clean minimalist white t-shirt mockup with logo placeholder on ${position.positionName}`;
                                  if (positionCode.includes('left-chest') || positionCode.includes('left-breast')) {
                                    mockupQuery = "Clean minimalist white t-shirt front view mockup with small logo placeholder on left chest";
                                  } else if (positionCode.includes('right-chest') || positionCode.includes('right-breast')) {
                                    mockupQuery = "Clean minimalist white t-shirt front view mockup with small logo placeholder on right chest";
                                  } else if (positionCode.includes('centre-chest')) {
                                    mockupQuery = "Clean minimalist white t-shirt front view mockup with logo placeholder on center chest";
                                  } else if (positionCode.includes('left-sleeve')) {
                                    mockupQuery = "Clean minimalist white t-shirt side view mockup with logo placeholder on left sleeve";
                                  } else if (positionCode.includes('right-sleeve')) {
                                    mockupQuery = "Clean minimalist white t-shirt side view mockup with logo placeholder on right sleeve";
                                  } else if (positionCode.includes('back')) {
                                    mockupQuery = "Clean minimalist white t-shirt back view mockup with large logo placeholder";
                                  }

                                  const mockupUrl = position.imageUrl
                                    ? (position.imageUrl.startsWith('http') ? position.imageUrl : `${BACKEND_URL}/${position.imageUrl}`)
                                    : `https://readdy.ai/api/search-image?query=${encodeURIComponent(mockupQuery)}&width=300&height=300&orientation=portrait`;

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
                                      className={`group relative flex flex-col rounded-3xl border-2 transition-all duration-300 bg-white overflow-hidden ${
                                        isSelected 
                                          ? 'border-[#009688] bg-[#009688]/5 shadow-2xl scale-[1.02]' 
                                          : 'border-[#E8ECF2] hover:border-[#009688]/50 hover:shadow-xl'
                                      }`}
                                    >
                                      <div className="aspect-[4/5] bg-[#F8F9FA] flex items-center justify-center p-4">
                                        <img 
                                          src={mockupUrl} 
                                          alt={position.positionName} 
                                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" 
                                        />
                                      </div>
                                      
                                      <div className="p-4 border-t border-[#E8ECF2] bg-white">
                                        <div className="font-bold text-[#009688] text-sm mb-1">{position.positionName}</div>
                                        <div className="flex items-center justify-between">
                                          <p className="text-[10px] text-[#6B7380] font-bold uppercase tracking-widest">{position.positionCode || 'Standard'}</p>
                                          {Number(position.priceAdjustment || 0) > 0 && (
                                            <p className="text-xs font-bold text-[#009688]">+${Number(position.priceAdjustment).toFixed(2)}</p>
                                          )}
                                        </div>
                                      </div>

                                      {isSelected && (
                                        <div className="absolute top-4 right-4 w-8 h-8 bg-[#009688] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                          <Check className="w-5 h-5 text-white stroke-[3px]" />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {selectedPositions.length > 0 && (
                                <div className="rounded-2xl border-2 border-dashed border-[#009688]/20 bg-[#009688]/5 p-6 animate-in fade-in slide-in-from-bottom-4">
                                  <h4 className="text-sm font-bold text-[#009688] mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <MapPin className="w-4 h-4" />
                                    Selected Positions ({selectedPositions.length})
                                  </h4>
                                  <div className="flex flex-wrap gap-3">
                                    {selectedPositions.map((pos) => (
                                      <span key={pos._id || pos.id} className="inline-flex items-center gap-2 bg-white border border-[#009688]/10 px-4 py-2 rounded-full text-xs font-bold text-[#009688] shadow-sm">
                                        {pos.positionName}
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPositions(prev => prev.filter(p => (p._id || p.id) !== (pos._id || pos.id)));
                                          }}
                                          className="hover:text-red-500 transition-colors"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {configStep === 'content' && (
                            <div className="max-w-2xl mx-auto space-y-6">
                              {selectedApplicationType === 'TEXT' ? (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-[#009688] mb-2">
                                    <Type size={20} />
                                    <label className="text-sm font-bold uppercase tracking-widest">Customization Text</label>
                                  </div>
                                  <textarea
                                    value={textValue}
                                    onChange={(e) => setTextValue(e.target.value)}
                                    rows={6}
                                    className="w-full rounded-2xl border border-[#E8ECF2] px-6 py-4 outline-none focus:border-[#009688] focus:ring-4 focus:ring-[#009688]/5 transition-all text-gray-700 font-medium"
                                    placeholder="Type your customization message here..."
                                  />
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {uploadedImageUrl ? (
                                    <div className="rounded-3xl border-2 border-green-100 bg-green-50/30 p-6 animate-in zoom-in duration-300">
                                      <div className="flex items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4 min-w-0">
                                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                                            <Check size={24} strokeWidth={3} />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-lg font-bold text-[#009688] truncate">Artwork Received</p>
                                            <p className="text-sm text-[#6B7380] truncate font-medium">{uploadedFile?.name || 'custom-logo.png'}</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setUploadedImageUrl(null);
                                            setUploadedFile(null);
                                            setUploadedFilePreview(null);
                                          }}
                                          className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                          <Trash2 size={20} />
                                        </button>
                                      </div>
                                      {uploadedFilePreview && (
                                        <div className="rounded-2xl overflow-hidden bg-white border border-green-100 shadow-lg p-4">
                                          <img src={uploadedFilePreview} alt="Logo preview" className="w-full max-h-72 object-contain" />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => fileInputRef.current?.click()}
                                      disabled={isUploading}
                                      className="w-full rounded-3xl border-2 border-dashed border-[#E8ECF2] bg-[#F8F9FA] px-10 py-16 text-center hover:border-[#009688] hover:bg-white hover:shadow-2xl transition-all duration-500 group relative"
                                    >
                                      {isUploading ? (
                                        <div className="flex flex-col items-center">
                                          <div className="w-12 h-12 border-4 border-[#009688] border-t-transparent rounded-full animate-spin mb-4" />
                                          <p className="text-gray-500 font-bold uppercase tracking-widest">Uploading Artwork...</p>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                            <Upload className="w-10 h-10 text-[#6B7380] group-hover:text-[#009688]" />
                                          </div>
                                          <h4 className="text-xl font-bold text-[#009688] mb-2">Upload Your Artwork</h4>
                                          <p className="text-sm text-[#6B7380] font-medium max-w-xs mx-auto">Click to browse your files or drag and drop your design here</p>
                                          <p className="text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-widest">Supported: PNG, JPG, SVG, PDF (Max 5MB)</p>
                                        </>
                                      )}
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
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-6 border-t border-[#E8ECF2] bg-white flex items-center justify-between shrink-0">
                  <button
                    onClick={() => {
                      if (configStep === 'method') {
                        onClose();
                      } else {
                        const steps = ['method', 'appType', 'position', 'content'];
                        const currentIdx = steps.indexOf(configStep);
                        if (currentIdx > 0) setConfigStep(steps[currentIdx - 1]);
                      }
                    }}
                    className="px-8 py-3.5 rounded-xl border-2 border-[#E8ECF2] text-[#6B7380] font-bold hover:text-[#009688] hover:border-[#009688] hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    {configStep === 'method' ? 'Cancel' : 'Back'}
                  </button>
                  
                  <button
                    onClick={() => {
                      const saved = saveCurrentSlotCustomization();
                      if (!saved && configStep === 'content') {
                        toast.error('Please complete the design step first');
                        return;
                      }
                      
                      const steps = ['method', 'appType', 'position', 'content'];
                      const currentIdx = steps.indexOf(configStep);
                      
                      if (currentIdx < steps.length - 1) {
                        setConfigStep(steps[currentIdx + 1]);
                      } else {
                        if (currentSlotIndex < slots.length - 1) {
                          handleSlotChange(currentSlotIndex + 1);
                        } else {
                          setShowReview(true);
                        }
                      }
                    }}
                    disabled={
                      (configStep === 'method' && !selectedMethodType) ||
                      (configStep === 'appType' && !selectedApplicationType) ||
                      (configStep === 'position' && selectedPositions.length === 0) ||
                      (configStep === 'content' && !isCurrentStepComplete)
                    }
                    className="px-10 py-3.5 rounded-xl bg-[#009688] text-white font-bold shadow-xl shadow-[#009688]/20 hover:bg-[#009688]/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all flex items-center gap-2"
                  >
                    {currentSlotIndex < slots.length - 1 || configStep !== 'content' ? (
                      <>
                        Continue
                        <ChevronRight size={20} />
                      </>
                    ) : (
                      <>
                        <ClipboardCheck size={20} />
                        Review Summary
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {showReview && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                        <Check size={40} strokeWidth={3} />
                      </div>
                      <h3 className="text-3xl font-bold text-[#009688]">Review Customizations</h3>
                      <p className="text-[#6B7380] mt-3 font-medium max-w-lg mx-auto">Excellent! Please review your configurations for each item before adding them to your cart.</p>
                    </div>

                    <div className="grid gap-6">
                      {Object.values(slotCustomizations).map((customization) => (
                        <div key={customization.slotId} className="group relative rounded-3xl border-2 border-white bg-white p-6 shadow-sm hover:shadow-2xl transition-all duration-300">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F8F9FA] border border-[#E8ECF2] flex-shrink-0">
                              {customization.productImage ? (
                                <img src={customization.productImage} alt={customization.slotName} className="w-full h-full object-contain p-2" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Sparkles size={32} />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-4">
                                <div>
                                  <h4 className="text-lg font-bold text-[#009688]">{customization.slotName}</h4>
                                  <p className="text-sm text-[#6B7380] font-medium uppercase tracking-wider">{customization.selectedProductName}</p>
                                </div>
                                <button
                                  onClick={() => handleSlotChange(slots.findIndex((slot) => slot.slotId === customization.slotId))}
                                  className="w-10 h-10 rounded-full bg-[#009688]/5 text-[#009688] flex items-center justify-center hover:bg-[#009688] hover:text-white transition-all"
                                >
                                  <PencilLine size={18} />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8ECF2]">
                                <div>
                                  <p className="text-[10px] font-bold text-[#6B7380] uppercase tracking-[0.2em] mb-2">Method & Decoration</p>
                                  <p className="text-sm text-[#009688] font-bold">{customization.method.applicationMethod} • {customization.method.applicationType}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-[#6B7380] uppercase tracking-[0.2em] mb-2">Decoration Placements</p>
                                  <div className="flex flex-wrap gap-2">
                                    {customization.positions.map((p, pIdx) => (
                                      <div key={p.id} className="flex items-center gap-2 bg-white border border-[#E8ECF2] rounded-lg px-2 py-1 shadow-sm">
                                        {p.imageUrl && (
                                          <img 
                                            src={p.imageUrl.startsWith('http') ? p.imageUrl : `${BACKEND_URL}/${p.imageUrl}`} 
                                            alt={p.positionName} 
                                            className="w-5 h-5 object-contain"
                                          />
                                        )}
                                        <span className="text-xs text-[#009688] font-bold">{p.positionName}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-[#6B7380] uppercase tracking-[0.2em] mb-2">Selected Content</p>
                                  {customization.content.type === 'TEXT' ? (
                                    <p className="text-sm text-[#009688] font-medium italic border-l-4 border-[#009688]/20 pl-3 py-1">"{customization.content.text}"</p>
                                  ) : (
                                    <div className="flex items-center gap-3">
                                      {customization.content.imageUrl && (
                                        <div className="w-10 h-10 rounded-lg border border-[#E8ECF2] p-1 bg-white">
                                          <img src={customization.content.imageUrl} alt="Logo" className="w-full h-full object-contain" />
                                        </div>
                                      )}
                                      <p className="text-sm text-[#009688] font-bold truncate">{customization.customizationFile?.name || 'custom-artwork.png'}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>


                    <div className="pt-4" />
                  </div>
                </div>

                <div className="px-6 py-6 border-t border-[#E8ECF2] bg-white flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setShowReview(false)}
                    className="px-8 py-3.5 rounded-xl border-2 border-[#E8ECF2] text-[#6B7380] font-bold hover:text-[#009688] hover:border-[#009688] hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    Back to Setup
                  </button>
                  <button
                    onClick={handleComplete}
                    className="px-12 py-3.5 rounded-xl bg-green-600 text-white font-bold shadow-xl shadow-green-600/20 hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Add Deal to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

DealCustomizationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  slots: PropTypes.array,
  initialCustomizations: PropTypes.object,
};