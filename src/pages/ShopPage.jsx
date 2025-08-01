import React from 'react'
import Navigate from '../components/shop/Navigate'
import Cards from '../components/shop/Cards'
import TabsBtns from '../components/shop/ProducsTabs/TabsBtns';
import TabsButtons from '@/components/Home/ProducsTabs/TabsButtons';
const ShopPage = () => {

  return (
    <div>
      <Navigate />
      <Cards/>
      <div className='mt-10'>

    <TabsButtons/>
      </div>
    </div>
  );
}

export default ShopPage