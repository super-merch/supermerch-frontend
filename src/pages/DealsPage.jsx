/**
 * Deals Page (Bundles) - Workwear-style implementation
 * Displays promotional deal bundles from admin panel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import noimage from '/noimage.png';

const DealsPage = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${backendUrl}/api/frontend/deals`);

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const data = await response.json();

      if (data.success) {
        setDeals(data.data || []);
      } else {
        setError('No deals available');
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDealClick = (slug) => {
    navigate(`/deals/${slug}`);
  };

  const getImageUrl = (url) => {
    if (!url) return noimage;
    return url.startsWith('http') ? url : `${backendUrl}/${url}`;
  };

  const formatPrice = (price) => {
    return `A$${parseFloat(price).toFixed(2)}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-brand py-10">
          <div className="Mycontainer">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Bundle Deals</h1>
                <p className="text-white/80 text-sm mt-1">
                  Complete promotional packages with exclusive savings
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-yellow-300 text-xl">⚡</span>
                <span className="text-white text-sm font-medium">Save up to 50%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Loading Grid */}
        <section className="py-8">
          <div className="Mycontainer">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-primary to-brand py-10">
          <div className="Mycontainer">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Bundle Deals</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="Mycontainer text-center">
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow-sm">
              <div className="text-4xl text-red-500 mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-brand mb-2">{error}</h2>
              <button
                onClick={fetchDeals}
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mt-4"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 bg-gradient-to-r from-primary via-brand to-primary">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="Mycontainer relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-yellow-300 text-xs font-bold tracking-widest uppercase">
              <span className="animate-pulse">⚡</span>
              <span>Limited Time Offers</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              The Ultimate <span className="italic relative">
                Bundle
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0 7C25 7 25 1 50 1C75 1 75 7 100 7" stroke="#FCD34D" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span> Deals
            </h1>

            {/* Subtitle */}
            <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl">
              Premium promotional packages curated for your business. Enjoy professional <span className="font-bold text-yellow-300">branding solutions</span> and massive savings on our best-selling products.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm shadow-sm border border-white/20 rounded-2xl">
                <span className="text-yellow-300 text-xl">🏷️</span>
                <span className="text-white text-sm font-semibold">Save up to 50%</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm shadow-sm border border-white/20 rounded-2xl">
                <span className="text-green-300 text-xl">🚚</span>
                <span className="text-white text-sm font-semibold">Free Shipping on $150+</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm shadow-sm border border-white/20 rounded-2xl">
                <span className="text-blue-300 text-xl">✨</span>
                <span className="text-white text-sm font-semibold">Custom Branding Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty State */}
      {deals.length === 0 && (
        <section className="py-20 relative z-10">
          <div className="Mycontainer text-center">
            <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-12 max-w-lg mx-auto shadow-lg">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-300">🎁</span>
              </div>
              <h2 className="text-2xl font-bold text-brand mb-3">Almost Ready...</h2>
              <p className="text-gray-600 mb-6">We're preparing some amazing bundle deals for you. Check back soon!</p>
              <button
                onClick={() => navigate('/shop')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Deals Grid */}
      {deals.length > 0 && (
        <section className="py-12 -mt-10 relative z-10">
          <div className="Mycontainer">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => handleDealClick(deal.slug)}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={getImageUrl(deal.bannerImage)}
                      alt={deal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {deal.isFeatured && (
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ FEATURED
                        </span>
                      )}
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {deal.savingsPercentage}% OFF
                      </span>
                    </div>

                    {/* Deal Type */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                        deal.dealType === 'FIXED' ? 'bg-blue-500 text-white' :
                        deal.dealType === 'FLEXIBLE' ? 'bg-green-500 text-white' :
                        'bg-purple-500 text-white'
                      }`}>
                        {deal.dealType}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Deal Code */}
                    <p className="text-xs text-gray-500 font-semibold mb-1">{deal.dealCode}</p>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {deal.title}
                    </h3>

                    {/* Description */}
                    {deal.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {deal.description}
                      </p>
                    )}

                    {/* Bundle Items */}
                    {deal.productSlots && deal.productSlots.length > 0 && (
                      <div className="mb-4 pb-4 border-b">
                        <p className="text-xs text-gray-500 mb-2">Bundle includes:</p>
                        <div className="flex flex-wrap gap-2">
                          {deal.productSlots.slice(0, 3).map((slot, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium"
                            >
                              {slot.slotName} ({slot.requiredQuantity})
                            </span>
                          ))}
                          {deal.productSlots.length > 3 && (
                            <span className="text-xs text-gray-500 font-medium">
                              +{deal.productSlots.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 line-through">
                          {formatPrice(deal.basePrice)}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(deal.dealPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          Save {formatPrice(deal.savingsAmount)}
                        </p>
                        {deal.includesCustomization && (
                          <p className="text-xs text-primary font-medium">✨ Branding Included</p>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    {!deal.inStock && (
                      <p className="text-sm text-red-600 font-semibold mb-4">⚠️ Limited Stock</p>
                    )}

                    {/* CTA */}
                    <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md group-hover:shadow-lg">
                      View Deal Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Showing {deals.length} active deal{deals.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                All deals are subject to availability and may be modified or terminated at any time
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DealsPage;
