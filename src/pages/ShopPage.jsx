import React from 'react'
import Navigate from '../components/shop/Navigate'
import Cards from '../components/shop/Cards'
import TabsBtns from '../components/shop/ProducsTabs/TabsBtns';
const ShopPage = () => {

  return (
    <div>
      <Navigate />
      <Cards/>
      <div className='mt-10'>

    <TabsBtns/>
      </div>
    </div>
  );
}

export default ShopPage