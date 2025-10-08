import TabsButtons from "@/components/Home/ProducsTabs/TabsButtons";
import ProductDetails from "../components/product/ProductDetails";
import ProductNavigate from "../components/product/ProductNavigate";

const ProducPage = () => {
  // const { id } = useParams();

  return (
    <div>
      <ProductNavigate />
      <ProductDetails />
      {/* <DescripTabs/> */}
      <div className="">
        <TabsButtons changeBg={true} />
      </div>
    </div>
  );
};

export default ProducPage;
