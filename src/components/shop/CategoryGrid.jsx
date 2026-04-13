import { useContext, useMemo } from "react";
import { ProductsContext } from "@/context/ProductsContext";
import CategoryCard from "./CategoryCard";

const CategoryGrid = () => {
  const { v1categories } = useContext(ProductsContext);

  // Define the main categories to display based on the image
  // Top row: Pens, Gift Sets, Mugs/Tumblers & Bottles, Bags, Apparel
  // Bottom row: Low & No Minimum Orders, Value Collection, Rush Production, Brands, Sale
  const mainCategories = useMemo(() => {
    // Map category IDs from navbar structure

    // Get actual categories from v1categories
    const actualCategories = [];
    if (v1categories && v1categories.length > 0) {
      // Find Writing (Pens) - try multiple ID variations
      const writing = v1categories.find(
        (cat) =>
          cat.id === "PY" ||
          cat.id === "N" ||
          cat.name === "Writing" ||
          cat.name === "Pens & Pencils"
      );
      if (writing) actualCategories.push({ ...writing, displayName: "Pens" });

      // Find Bags - try multiple ID variations
      const bags = v1categories.find(
        (cat) => cat.id === "PA" || cat.id === "A" || cat.name === "Bags"
      );
      if (bags) actualCategories.push(bags);

      // Find Drinkware (Mugs, Tumblers & Bottles) - try multiple ID variations
      const drinkware = v1categories.find(
        (cat) => cat.id === "PE" || cat.id === "C" || cat.name === "Drinkware"
      );
      if (drinkware)
        actualCategories.push({
          ...drinkware,
          displayName: "Drinkware",
        });

      // Find Clothing (Apparel) - try multiple ID variations
      const clothing = v1categories.find(
        (cat) => cat.id === "PB" || cat.id === "PU" || cat.name === "Clothing"
      );
      if (clothing)
        actualCategories.push({ ...clothing, displayName: "Apparel" });
    }

    // Add special categories that aren't in v1categories
    const specialCategories = [
      { name: "Gift Sets", id: "PG", isSpecial: true },
      { name: "Low & No Minimum Orders", isSpecial: true },
      { name: "Value Collection", isSpecial: true },
      { name: "24hr Production", isSpecial: true },
      { name: "Brands", isSpecial: true },
      { name: "Sale", isSpecial: true },
    ];

    const orderedCategories = [...actualCategories, ...specialCategories];

    return orderedCategories;
  }, [v1categories]);

  return (
    <div className="Mycontainer py-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 md:mb-8 text-center">
        SHOP OUR TOP SELLING CATEGORIES
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 gap-y-10">
        {mainCategories.map((category, index) => (
          <CategoryCard
            key={category.id || category.name || index}
            category={{
              ...category,
              name: category.displayName || category.name,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
