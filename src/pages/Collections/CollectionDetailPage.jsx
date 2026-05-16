import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LoadingOverlay, 
  Breadcrumb 
} from '../../components/Common';
import RouteSeo from '../../components/Common/RouteSeo';
import Cards from '../../components/shop/Cards';

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
    <div className="bg-gray-50 min-h-screen">
      <RouteSeo 
        title={`${collection.name} | SuperMerch`} 
        description={collection.shortDescription || `Browse products in our ${collection.name} collection.`}
      />
      
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            items={[
              { label: 'Collections', path: '#' }, // Non-navigable
              { label: collection.name, path: `/collections/${collection.slug}` }
            ]} 
          />
          
          <div className="mt-8 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate tracking-tight">
                {collection.name}
              </h1>
              {collection.shortDescription && (
                <p className="mt-2 text-lg text-gray-500 max-w-3xl">
                  {collection.shortDescription}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {totalCount} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <Cards category="collection" />
      </div>
    </div>
  );
};

export default CollectionDetailPage;
