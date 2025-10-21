import TabsButtons from "@/components/Home/ProducsTabs/TabsButtons";
import ProductNavigate from "../components/product/ProductNavigate";
import ProductDetails from "@/components/product/ProductDetails/index";

const ProducPage = () => {
  // const { id } = useParams();

  return (
    <div>
      <ProductNavigate />
      <ProductDetails />
      {/* <DescripTabs/> */}
      <div className="">
        <TabsButtons />
      </div>
    </div>
  );
};

export default ProducPage;
