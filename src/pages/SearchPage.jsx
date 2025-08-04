import React from 'react'
import Navigate from '../components/shop/Navigate'
import Cards from '../components/shop/Cards'
import TabsBtns from '../components/shop/ProducsTabs/TabsBtns';
import SearchCard from '@/components/shop/SearchCard';
import TabsButtons from '@/components/Home/ProducsTabs/TabsButtons';
const SearchPage = () => {

  return (
    <div>
      <SearchCard/>
      <div className='mt-10'>   
    <TabsButtons />
      </div>
    </div>
  );
}

export default SearchPage