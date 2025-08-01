import React from 'react'
import Navigate from '../components/shop/Navigate'
import Cards from '../components/shop/Cards'
import TabsBtns from '../components/shop/ProducsTabs/TabsBtns';
import TrendCards from '@/components/shop/TrendCards';
import TabsButtons from '@/components/Home/ProducsTabs/TabsButtons';
const BestSellers = () => {

  return (
    <div>
      <TrendCards/>
      <div className='mt-10'>   

    <TabsButtons/>
      </div>
    </div>
  );
}

export default BestSellers