import { useSelector } from "react-redux";
import Promotional from "./Promotional";

const PromotionalDisplay = () => {
    const { filteredProducts } = useSelector((state) => state.filters);
    console.log(useSelector((state) => state, "state"))
    return (
        <div>
            {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500">No products available for this category.</p>
            ) : (
                filteredProducts.map((product) => (
                    <Promotional key={product.id} product={product} />
                ))
            )}
            {/* {filteredProducts.map((product) => (
        <Promotional key={product.id} product={product} />
      ))} */}
        </div>
    );
};

export default PromotionalDisplay;
