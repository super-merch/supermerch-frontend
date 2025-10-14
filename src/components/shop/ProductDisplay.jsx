import { useSelector } from "react-redux";
import Cards from "./Cards";

const ProductList = () => {
  const { filteredProducts } = useSelector((state) => state.filters);
  return (
    <div>
      {filteredProducts.map((product) => (
        <Cards key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
