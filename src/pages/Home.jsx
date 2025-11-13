import { useEffect } from "react";
import HomeContent from "../components/Home/HomeContent";
import HomeModals from "../components/Home/HomeModals";
import { useModals } from "../hooks/useModals";
import { useCoupons } from "../hooks/useCoupons";
import { useSessionStorageBoolean } from "../hooks/useSessionStorage";

const Home = () => {
  const {
    discountModal,
    emailModal,
    cookieModal,
    openDiscountModal,
    openCookieModal,
    closeDiscountModal,
    closeEmailModal,
    closeCookieModal,
    openEmailModal,
    setDiscountModal,
    setEmailModal,
    setCookieModal,
  } = useModals();
  const { fetchCurrentCoupon } = useCoupons();
  const [discountModalShown, setDiscountModalShown] = useSessionStorageBoolean(
    "discountModalShown",
    false
  );
  const [cookieModalShown, setCookieModalShown] = useSessionStorageBoolean(
    "cookieModalShown",
    false
  );

  // Expose function to trigger discount modal from parent
  useEffect(() => {
    const handleCouponClick = () => {
      openDiscountModal();
    };

    // Listen for custom event from top banner
    window.addEventListener("triggerDiscountModal", handleCouponClick);

    return () => {
      window.removeEventListener("triggerDiscountModal", handleCouponClick);
    };
  }, [openDiscountModal]);
  useEffect(() => {
    const cookieAccepted = localStorage.getItem("cookieAccepted");
    if (!cookieAccepted && !cookieModalShown) {
      openCookieModal();
    }
  }, [cookieModalShown, openCookieModal]);

  useEffect(() => {
    if (!discountModalShown) {
      openDiscountModal();
    }
  }, [discountModalShown, openDiscountModal]);

  return (
    <div>
      <HomeContent />
      <HomeModals
        discountModal={discountModal}
        emailModal={emailModal}
        cookieModal={cookieModal}
        closeDiscountModal={() => {
          closeDiscountModal();
          setDiscountModalShown(true);
        }}
        closeEmailModal={() => {
          closeEmailModal();
        }}
        closeCookieModal={() => {
          closeCookieModal();
          localStorage.setItem("cookieAccepted", "true");
          setCookieModalShown(true);
        }}
        openEmailModal={openEmailModal}
      />
      {/* <WhyUs /> */}
    </div>
  );
};

export default Home;
