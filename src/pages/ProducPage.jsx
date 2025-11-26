import TabsButtons from "@/components/Home/ProducsTabs/ShopOurBestSellers";
import ProductNavigate from "../components/product/ProductNavigate";
import ProductDetails from "@/components/product/ProductDetails/index";
import { useState, useEffect, useContext } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/context/AppContext";

const ProducPage = () => {
  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("ref");
  const id = encodedId ? atob(encodedId) : null;
  const { backednUrl } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${backednUrl}/api/single-product/${id}`
        );
        if (data) {
          setProduct(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchProduct();
  }, [id, backednUrl]);

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
