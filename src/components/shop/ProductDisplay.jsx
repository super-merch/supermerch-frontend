import { useSelector } from "react-redux";
import Cards from "./Cards";

const ProductList = () => {
    const { filteredProducts } = useSelector((state) => state.filters);
    console.log(useSelector((state)=>state,"state"))
  return (
    <div>
      {filteredProducts.map((product) => (
        <Cards key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
