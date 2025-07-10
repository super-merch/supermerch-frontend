import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBrands, applyFilters } from "../../redux/slices/filterSlice";

const BrandCheckboxes = () => {
  const dispatch = useDispatch();
  const selectedBrands = useSelector((state) => state.filters.selectedBrands);

  const brands = [
    "Apple",
    "Microsoft",
    "Symphony",
    "Dell",
    "Sony",
    "LG",
    "One Plus",
    "Google",
    "Samsung",
    "HP",
    "Xiaomi",
    "Panasonic",
    "Intel",
  ];

  const handleCheckboxChange = (brand) => {
    const updatedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];

    dispatch(setSelectedBrands(updatedBrands));
    dispatch(applyFilters());
  };

    return (
      <>
      <h1 className=" uppercase text-base font-medium pt-6 ">popular Brands</h1>
    <div className="grid grid-cols-2 mt-3 border-b-2 pb-7">
      {brands.map((brand) => (
          <label key={brand} className="flex items-center mt-3 gap-2">
          <input
            type="checkbox"
            value={brand}
            checked={selectedBrands.includes(brand)}
                  onChange={() => handleCheckboxChange(brand)}
                  className="w-5 h-5"
              />
              <p className="text-sm">
                  
          {brand}
              </p>
        </label>
      ))}
    </div>
      </>
  );
};

export default BrandCheckboxes;
