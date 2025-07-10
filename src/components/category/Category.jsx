
import React, { useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import { megaMenu } from "@/assets/assets";
import { toast } from "react-toastify";
import collection4 from "../../assets/collection4.png";

const Category = () => {
  const { shopCategory, setSelectedParamCategoryId, setActiveFilterCategory, setCurrentPage, setSidebarActiveCategory } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const mainCategoryId = queryParams.get("category");
  const mainCategoryName = queryParams.get("categoryName");
  const subCategoryLabel = queryParams.get("subCategory");

  // Find the main category using the id from the query parameter
  const mainCategory = megaMenu.find((cat) => cat.id === mainCategoryId);
  // Find the subcategory using the selected shopCategory (e.g., "Pens")
  const subCategory = mainCategory?.subTypes.find(
    (sub) => sub.label === subCategoryLabel
  );

  const handleSubCategories = (subCategory, categoryId, titleName, labelName) => {
    if (!categoryId) {
        toast.error("Category ID is missing!");
        return;
    }
    const encodedTitleName = encodeURIComponent(titleName); // Encode the title
    const encodedLabelName = encodeURIComponent(labelName); // Encode the title
    navigate(`/Spromotional?categoryName=${encodedTitleName}&category=${categoryId}&label=${encodedLabelName}`);
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory)
    setCurrentPage(1);
    setSidebarActiveCategory(titleName)
};

  return (
    <div className="Mycontainer">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mt-4 text-lg text-smallHeader">
        <Link to="/">Home</Link>
        <span>{`>`}</span>
        <span>{mainCategoryName}</span>
        <span>{`>`}</span>
        <span>{subCategoryLabel}</span>
      </div>

      <h1 className="pt-6 text-5xl font-semibold text-brand">
        {mainCategoryName} - {subCategoryLabel}
      </h1>

      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {subCategory?.items ? (
          subCategory.items.map((item) => (
            <div
              key={item.id}
              className="text-center transition duration-300 transform border rounded shadow-sm cursor-pointer group hover:scale-105"
              onClick={() => {
                handleSubCategories(item.name, item.id, mainCategory.name, subCategoryLabel)
              }
              }
            >
              <img
              src={collection4}
              alt=""
              className="w-full mb-3"
            />
              <p className="text-lg font-medium">{item.name}</p>
            </div>
          ))
        ) : (
          <p>No items found for this subcategory.</p>
        )}
      </div>
    </div>
  );
};

export default Category;
