import { useNavigate } from "react-router-dom";

// Import category images
import bagsImage from "@/assets/bag.jpg";
import {
  default as giftSetsImage,
  default as saleImage,
} from "@/assets/misc.jpg";
import lowMinImage from "@/assets/mug.jpg";
import { default as pensImage, default as rushImage } from "@/assets/pen.jpg";
import apparelImage from "@/assets/shirt.png";
import {
  default as brandsImage,
  default as drinkwareImage,
} from "@/assets/thumbler.jpg";
import valueImage from "@/assets/tote.jpg";

const CategoryCard = ({ category, onClick }) => {
  const navigate = useNavigate();

  // Map category names to images
  const getCategoryImage = (name) => {
    const imageMap = {
      Writing: pensImage,
      Pens: pensImage,
      Bags: bagsImage,
      Drinkware: drinkwareImage,
      "Mugs, Tumblers & Bottles": drinkwareImage,
      Apparel: apparelImage,
      Clothing: apparelImage,
      "Gift Sets": giftSetsImage,
      "Low & No Minimum Orders": lowMinImage,
      "Value Collection": valueImage,
      "Rush Production": rushImage,
      "24hr Production": rushImage,
      Brands: brandsImage,
      Sale: saleImage,
    };

    // Try exact match first, then partial match
    if (imageMap[name]) {
      return imageMap[name];
    }

    // Partial matching for category names
    const lowerName = name.toLowerCase();
    if (lowerName.includes("pen") || lowerName.includes("writing")) {
      return pensImage;
    }
    if (lowerName.includes("bag")) {
      return bagsImage;
    }
    if (
      lowerName.includes("drink") ||
      lowerName.includes("mug") ||
      lowerName.includes("bottle") ||
      lowerName.includes("tumbler")
    ) {
      return drinkwareImage;
    }
    if (
      lowerName.includes("cloth") ||
      lowerName.includes("apparel") ||
      lowerName.includes("shirt")
    ) {
      return apparelImage;
    }
    if (lowerName.includes("gift")) {
      return giftSetsImage;
    }

    // Default image
    return bagsImage;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(category);
    } else {
      // Default navigation based on category
      const categoryName = category.name || category;

      // Handle special categories
      if (categoryName === "Sale" || categoryName === "Deals") {
        navigate("/sales");
        return;
      }

      if (
        categoryName === "24hr Production" ||
        categoryName === "Rush Production"
      ) {
        navigate("/24hr-production");
        return;
      }

      if (categoryName === "Value Collection") {
        navigate("/promotional?categoryName=Bags&category=PA&type=Promotional");
        return;
      }

      if (categoryName === "Low & No Minimum Orders") {
        navigate(
          "/promotional?categoryName=Drinkware&category=PE&type=Promotional"
        );
        return;
      }

      if (categoryName === "Brands") {
        navigate(
          "/promotional?categoryName=Drinkware&category=PE&type=Promotional"
        );
        return;
      }

      if (categoryName === "Gift Sets") {
        navigate(
          "/promotional?categoryName=Office & Business&category=PR&type=Promotional"
        );
        return;
      }

      // Handle category name mappings
      let mappedName = categoryName;
      let categoryType = "Promotional";

      if (categoryName === "Pens") {
        mappedName = "Writing";
      } else if (categoryName === "Mugs, Tumblers & Bottles") {
        mappedName = "Drinkware";
      } else if (categoryName === "Apparel") {
        // Navigate to Clothing page instead of promotional
        navigate("/Clothing");
        return;
      }

      // Navigate with category ID if available
      if (category.id) {
        navigate(
          `/promotional?categoryName=${encodeURIComponent(
            mappedName
          )}&category=${category.id}&type=${categoryType}`
        );
      } else {
        navigate(
          `/promotional?categoryName=${encodeURIComponent(
            mappedName
          )}&type=${categoryType}`
        );
      }
    }
  };

  const categoryName = category.name || category;
  const categoryImage = getCategoryImage(categoryName);

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden text-center"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={categoryImage}
          alt={categoryName}
          className="w-full h-full object-cover transition-transform duration-500"
        />
      </div>
      <span className="w-full text-gray-900 text-center text-sm sm:text-base truncate hover:underline">
        {categoryName}
      </span>
    </div>
  );
};

export default CategoryCard;
