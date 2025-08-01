import React from 'react'
import ProductDetails from '../components/product/ProductDetails'
import ProductNavigate from '../components/product/ProductNavigate'
import TabsBtns from '../components/shop/ProducsTabs/TabsBtns'
import DescripTabs from '../components/product/DescriptionTabs/DescripTabs'
import useFetchProducts from '../hooks/useFetchProducts'
import { useParams } from "react-router-dom";
import TabsButtons from '@/components/Home/ProducsTabs/TabsButtons'


const ProducPage = () => {
  // const { id } = useParams();
  

  return (
    <div>
      <ProductNavigate />
      <ProductDetails  />
      {/* <DescripTabs/> */}
      <div className="">
        <TabsButtons />
      </div>
    </div>
  );
}

export default ProducPage