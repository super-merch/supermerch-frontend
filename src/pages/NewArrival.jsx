import React from 'react'
import Navigate from '../components/shop/Navigate'
import Cards from '../components/shop/Cards'
import TabsBtns from '../components/shop/ProducsTabs/TabsBtns';
import TrendCards from '@/components/shop/TrendCards';
import ArrivalCards from '@/components/shop/ArrivalCards';
import TabsButtons from '@/components/Home/ProducsTabs/TabsButtons';
const NewArrival = () => {

  return (
    <div>
      <ArrivalCards/>
      <div className='mt-10'>   

    <TabsButtons/>
      </div>
    </div>
  );
}

export default NewArrival