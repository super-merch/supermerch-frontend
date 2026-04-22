import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DealCard from '../components/deals/DealCard';

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

  const pageHeader = (
    <section className="bg-gradient-to-r from-[#0C8F80] to-[#13A796] py-9">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-[38px] font-bold text-white leading-tight">Bundle Deals</h1>
            <p className="text-[#D7E3F8] text-sm mt-1">
              Complete merch packages with free setup. Save big on team outfitting.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-medium">🏷️ Bundle Pricing</span>
            <span className="px-4 py-2 rounded-lg bg-[#0A7568] text-white text-xs font-bold">✨ Free Setup</span>
          </div>
        </div>
      </div>
    </section>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF0F4]">
        {pageHeader}
        <section className="py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[32px] border border-[#D8E1EA] overflow-hidden animate-pulse cursor-pointer w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-[420px]"
                >
                  <div className="relative aspect-[4/3] bg-gray-200"></div>
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="space-y-2 w-1/2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-9 bg-gray-200 rounded w-28"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-11 bg-gray-200 rounded-2xl w-full"></div>
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
      <div className="min-h-screen bg-[#EEF0F4]">
        {pageHeader}

        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow-sm">
              <div className="text-4xl text-red-500 mb-3">⚠</div>
              <h2 className="text-lg font-bold text-[#0A5D59] mb-2">{error || 'Failed to load bundle deals'}</h2>
              <button
                onClick={fetchDeals}
                className="bg-[#0F9D8A] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0C8A79] transition-colors mt-4"
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
    <div className="min-h-screen bg-[#EEF0F4]">
      {pageHeader}

      {deals.length === 0 && (
        <section className="py-16">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <div className="bg-white rounded-2xl p-10 max-w-lg mx-auto shadow-sm border border-[#E8ECF2]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-300">🎁</span>
              </div>
              <h2 className="text-2xl font-bold text-[#0A5D59] mb-3">Almost Ready...</h2>
              <p className="text-[#6B7380] mb-8">We are curating new exclusive bundles for you. Check back soon or browse our full collection.</p>
              <button
                onClick={() => navigate('/shop')}
                className="w-full bg-[#0F9D8A] text-white py-3 rounded-lg font-semibold hover:bg-[#0C8A79] transition-colors"
              >
                Explore Full Catalog
              </button>
            </div>
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className="py-12 pb-24 relative z-10">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} backendUrl={backendUrl} onClick={() => handleDealClick(deal.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-9 bg-white border-y border-[#D0D5DD]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[40px] font-bold text-[#0A5D59] text-center mb-8 leading-none">
            Why Choose Bundle Deals?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#E9FBF8] border border-[#C8F1EB]">
              <div className="w-10 h-10 bg-[#0F9D8A] rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                🏷️
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#01164F] mb-1">Bundle Savings</h3>
                <p className="text-xs text-[#6B7380]">Deal savings are shown per bundle based on your configured pricing</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <div className="w-10 h-10 bg-[#0A7568] rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                ✨
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#01164F] mb-1">Free Setup</h3>
                <p className="text-xs text-[#6B7380]">Professional customization included</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#E7F7F4] border border-[#BCE9E1]">
              <div className="w-10 h-10 bg-[#0F9D8A] rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                🚚
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#01164F] mb-1">Fast Delivery</h3>
                <p className="text-xs text-[#6B7380]">Quick shipping nationwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DealsPage;
