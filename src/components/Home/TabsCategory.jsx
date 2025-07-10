
import { megaMenu } from '@/assets/assets';
import { AppContext } from '@/context/AppContext';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Assume megaMenu is imported or defined somewhere in your code
// import megaMenu from './megaMenuData';
import collection2 from "../../assets/collection2.png";

const TabsCategory = () => {
  const navigate = useNavigate();
  const { shopCategory, setShopCategory } = useContext(AppContext)
  // Set the first category (Writing) as default active tab
  const [activeTab, setActiveTab] = useState(megaMenu[0].id);

  // Find the active category object from megaMenu array
  const activeCategory = megaMenu.find((category) => category.id === activeTab);

  // Handle switching the main category tab
  const handleCategoryClick = (id) => {
    setActiveTab(id);
  };

  // Handler for when a user clicks on a subcategory (like Pens, Pencils, etc.)
  const handleSubCategoryClick = (subCategory) => {
    const encodedMain = encodeURIComponent(activeCategory.name);
    // Navigate with query parameters: you can adjust the route as needed
    navigate(`/category?categoryName=${encodedMain}&subCategory=${subCategory.label}&category=${activeCategory.id}`);
    setShopCategory(subCategory.label)
  };

  // Optional: Handler for clicking on a sub-item (e.g., Metal Pens)
  const handleSubItemClick = (subItem) => {
    const encodedMain = encodeURIComponent(activeCategory.name);
    const encodedSubItem = encodeURIComponent(subItem.name);
    // Navigate to a more detailed page (for example, listing products for this sub-item)
    navigate(`/category?main=${encodedMain}&item=${encodedSubItem}`);
  };

  return (
    <div>
      <div className="bg-bgColor">
        <div className="Mycontainer pb-16">
          <h1 className="text-3xl lg:text-5xl md:text-5xl text-smallHeader font-bold text-center lg:pt-10 md:pt-10 sm:pt-10 pt-6">
            Shop by category
          </h1>
          {/* <div className="TabsCategory"> */}
            {/* Main Category Tabs */}
            <div className="lg:mt-4 md:mt-4 mt-0  flex justify-between lg:grid md:grid sm:grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-4 items-center lg:gap-6 md:gap-6 sm:gap-4 gap-1 border-b-4 border-borderb">
              {megaMenu.slice(0, 4).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`py-4 text-start focus:outline-none text-sm lg:text-xl md:text-xl font-bold ${category.id === activeTab ? 'border-b-4 border-primary text-primary' : 'text-gray-600'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Subcategories for the active main category */}
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 text-center lg:gap-6 md:gap-6 gap-3">
              {activeCategory &&
                activeCategory.subTypes.map((subCategory) => (
                  <div key={subCategory.label}
                    onClick={() => handleSubCategoryClick(subCategory)}
                    className="bg-white lg:p-5 md:p-5 p-2 cursor-pointer">
                    <img src={collection2} alt="" className="w-full" />
                    <h3
                      className="text-brand lg:pt-3 md:pt-3 sm:pt-3 pt-1 lg:text-lg md:text-lg sm:text-lg text-xs font-medium"
                    >
                      {subCategory.label}
                    </h3>
                  </div>
                ))}
            </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default TabsCategory;
