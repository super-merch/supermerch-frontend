import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import ProductNavigate from "../components/product/ProductNavigate";
import ProductDetails from "@/components/product/ProductDetails/index";
import { useState, useEffect, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/context/AppContext";

const ProducPage = () => {
  const { id } = useParams(); // Get slug from URL path
  const { backendUrl } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        // Pass the slug (or ID) to the backend
        const { data } = await axios.get(
          `${backendUrl}/api/single-product/${id}`
        );
        if (data) {
          setProduct(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchProduct();
  }, [id, backendUrl]);

  return (
    <div>
      <ProductNavigate product={product} />
      <ProductDetails product={product} />
      {/* <DescripTabs/> */}
      <div className="">
        <TabsButtons />
      </div>
    </div>
  );
};

export default ProducPage;
