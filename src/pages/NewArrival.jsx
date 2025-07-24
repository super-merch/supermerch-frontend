import React from 'react'
import Navigate from '../components/shop/Navigate'
import Cards from '../components/shop/Cards'
import TabsBtns from '../components/shop/ProducsTabs/TabsBtns';
import TrendCards from '@/components/shop/TrendCards';
import ArrivalCards from '@/components/shop/ArrivalCards';
const NewArrival = () => {

  return (
    <div>
      <ArrivalCards/>
      <div className='mt-10'>   

    <TabsBtns/>
      </div>
    </div>
  );
}

export default NewArrival