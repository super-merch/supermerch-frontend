import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoadingOverlay } from '../../components/Common';
import Breadcrumb from '../../components/shared/Breadcrumb';
import SeoHelmet from '../../components/Common/SeoHelmet';
import Cards from '../../components/shop/Cards';
import ShopOurBestSellers from '../../components/Home/ProducsTabs/ShopOurBestSellers';

const CollectionDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7029';

  const fetchCollectionMeta = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/public/collection/${slug}`, {
        params: { page: 1, limit: 1 } // Just fetch meta
      });

      if (response.data.success) {
        setCollection(response.data.collection);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching collection meta:', error);
      if (error.response?.status === 404) {
        navigate('/404');
      }
    } finally {
      setLoading(false);
    }
  }, [slug, apiUrl, navigate]);

  useEffect(() => {
    fetchCollectionMeta();
  }, [fetchCollectionMeta]);

  if (loading) {
    return (
      <LoadingOverlay
        title="Loading Collection"
        subtitle={`Preparing ${collection?.name || 'your collection'}...`}
        variant="product"
        showBrand={true}
      />
    );
  }

  if (!collection) return null;

  return (
    <div className="bg-gray-100 min-h-screen">
      <SeoHelmet
        entityType="category"
        entityId={`collection-${slug}`}
        fallback={{
          title: `${collection.name} | Super Merch Australia`,
          description: collection.shortDescription || `Browse products in our ${collection.name} collection.`,
          canonicalUrl: `https://www.supermerch.com.au/collections/${encodeURIComponent(slug)}`,
          ogImage: 'https://www.supermerch.com.au/logo-teal.png',
          ogImageAlt: `${collection.name} collection | Super Merch Australia`,
          robots: 'index, follow',
        }}
      />
      
      <Breadcrumb 
        customItems={[
          { label: 'Collections', path: '#' },
          { label: collection.name, path: `/collections/${collection.slug}` }
        ]} 
      />

      <Cards category="collection" />

      <div className="mt-10 bg-primary/10 py-10">
        <ShopOurBestSellers />
      </div>
    </div>
  );
};

export default CollectionDetailPage;
