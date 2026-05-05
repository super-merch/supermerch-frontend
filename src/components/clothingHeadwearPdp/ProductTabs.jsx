
import { useState } from 'react';

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'care', label: 'Care Instructions' },
    { id: 'qa', label: 'Q&A' },
    { id: 'shipping', label: 'Shipping & Returns' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="space-y-4">
            <div>
              <p 
                className="text-[#1E2328] leading-relaxed mb-4"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '24px' }}
                dangerouslySetInnerHTML={{ __html: product.description }}
              >
                {/* {product.description} */}
              </p>
              
              {product.features && product.features.length > 0 && (
                <div>
                  <h4 
                    className="text-[#009688] font-semibold mb-3"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}
                  >
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li 
                        key={index}
                        className="flex items-start space-x-2"
                      >
                        <i className="ri-check-line text-[#10B981] text-base mt-0.5 flex-shrink-0"></i>
                        <span 
                          className="text-[#1E2328]"
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 'specifications':
        return (
          <div className="space-y-2">
            {product.specifications && Object.entries(product.specifications).map(([key, value], index) => (
              <div 
                key={key}
                className={`flex items-center justify-between py-2.5 px-3 rounded-md transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-gradient-to-r from-[#F8FAFC] to-[#FEFEFE]' : 'bg-white'
                } hover:shadow-sm border border-[#CBD5E1]/50`}
              >
                <span 
                  className="text-[#1E2328] font-semibold"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}
                >
                  {key}
                </span>
                <span 
                  className="text-[#6B7380] font-medium text-right"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.safetyRating && (
                <div className="group bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-lg p-4 border border-[#10B981]/20 hover:border-[#10B981] hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                      <i className="ri-shield-check-line text-[#10B981] text-lg"></i>
                    </div>
                    <h4 
                      className="text-[#1E2328] font-bold"
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                    >
                      Safety Certification
                    </h4>
                  </div>
                  <p 
                    className="text-[#1E2328] font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                  >
                    {product.safetyRating}
                  </p>
                </div>
              )}
              
              <div className="group bg-gradient-to-br from-[#f0fdfa] to-[#e0f2f1] rounded-lg p-4 border border-[#009688]/20 hover:border-[#009688] hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <i className="ri-award-line text-[#009688] text-lg"></i>
                  </div>
                  <h4 
                    className="text-[#1E2328] font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                  >
                    Quality Assurance
                  </h4>
                </div>
                <p 
                  className="text-[#1E2328] font-medium"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                >
                  ISO 9001:2015 Quality Management System certified
                </p>
              </div>
            </div>
          </div>
        );

      case 'care':
        return (
          <div className="space-y-3">
            {product.careInstructions && product.careInstructions.length > 0 ? (
              <ul className="space-y-2">
                {product.careInstructions.map((instruction, index) => (
                  <li 
                    key={index}
                    className="flex items-start space-x-2"
                  >
                    <i className="ri-information-line text-[#009688] text-base mt-0.5 flex-shrink-0"></i>
                    <span 
                      className="text-[#1E2328]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                    >
                      {instruction}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-[#009688] text-base mt-0.5 flex-shrink-0"></i>
                  <span 
                    className="text-[#1E2328]"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                  >
                    Machine wash at 40°C maximum
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-[#009688] text-base mt-0.5 flex-shrink-0"></i>
                  <span 
                    className="text-[#1E2328]"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                  >
                    Do not bleach or use fabric softener
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-[#009688] text-base mt-0.5 flex-shrink-0"></i>
                  <span 
                    className="text-[#1E2328]"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                  >
                    Tumble dry on low heat setting
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-[#009688] text-base mt-0.5 flex-shrink-0"></i>
                  <span 
                    className="text-[#1E2328]"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px' }}
                  >
                    Iron on low temperature if needed
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'qa':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="group bg-gradient-to-r from-[#F8FAFC] to-[#EDF2F7] border-2 border-[#CBD5E1] rounded-xl p-6 hover:border-[#009688] hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#009688] to-[#00796B] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Q</span>
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="text-[#009688] font-bold mb-3"
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '17px' }}
                    >
                      What sizes are available?
                    </h4>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white border-2 border-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#10B981] font-bold" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>A</span>
                      </div>
                      <p 
                        className="text-[#1E2328] flex-1"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '24px' }}
                      >
                        This product is available in sizes {product.sizes?.join(', ')}. Please refer to our size guide for detailed measurements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-r from-[#F8FAFC] to-[#EDF2F7] border-2 border-[#CBD5E1] rounded-xl p-6 hover:border-[#009688] hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#009688] to-[#00796B] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Q</span>
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="text-[#009688] font-bold mb-3"
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '17px' }}
                    >
                      Is this product suitable for outdoor work?
                    </h4>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white border-2 border-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#10B981] font-bold" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>A</span>
                      </div>
                      <p 
                        className="text-[#1E2328] flex-1"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '24px' }}
                      >
                        Yes, this product is designed for professional workwear and is suitable for outdoor environments. It meets industry safety standards and provides excellent durability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-r from-[#F8FAFC] to-[#EDF2F7] border-2 border-[#CBD5E1] rounded-xl p-6 hover:border-[#009688] hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#009688] to-[#00796B] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Q</span>
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="text-[#009688] font-bold mb-3"
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '17px' }}
                    >
                      How do I care for this product?
                    </h4>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white border-2 border-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#10B981] font-bold" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>A</span>
                      </div>
                      <p 
                        className="text-[#1E2328] flex-1"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '24px' }}
                      >
                        Please follow the care instructions provided in the Care Instructions tab. Generally, machine wash at 40°C and avoid bleach to maintain the product's quality and safety features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 
                  className="text-[#009688] font-semibold mb-4"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}
                >
                  Shipping Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <i className="ri-truck-line text-[#10B981] text-lg"></i>
                    <span 
                      className="text-[#1E2328]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    >
                      Free delivery on orders over £50
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-time-line text-[#009688] text-lg"></i>
                    <span 
                      className="text-[#1E2328]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    >
                      1-3 business days delivery
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-map-pin-line text-[#6B7380] text-lg"></i>
                    <span 
                      className="text-[#1E2328]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    >
                      UK mainland delivery available
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 
                  className="text-[#009688] font-semibold mb-4"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}
                >
                  Returns Policy
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <i className="ri-arrow-go-back-line text-[#10B981] text-lg"></i>
                    <span 
                      className="text-[#1E2328]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    >
                      30-day return window
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-refund-line text-[#009688] text-lg"></i>
                    <span 
                      className="text-[#1E2328]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    >
                      Full refund on unused items
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="ri-exchange-line text-[#6B7380] text-lg"></i>
                    <span 
                      className="text-[#1E2328]"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    >
                      Free exchanges available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation - Mobile scrollable */}
      <div className="bg-gradient-to-r from-[#F8FAFC] to-[#FEFEFE] border-b border-[#CBD5E1] rounded-t-xl overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-shrink-0 px-3 sm:px-4 py-3 font-semibold transition-all duration-300 snap-start whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#009688] bg-white shadow-sm'
                  : 'text-[#6B7380] hover:text-[#009688] hover:bg-white/50'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#009688] to-[#00796B] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Mobile optimized */}
      <div className="min-h-[200px] sm:min-h-[300px] bg-white rounded-b-xl border-x border-b border-[#CBD5E1] p-3 sm:p-5 shadow-sm">
        {renderTabContent()}
      </div>
    </div>
  );
}
