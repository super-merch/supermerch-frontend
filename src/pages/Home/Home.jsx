import { useEffect } from "react";
import HomeContent from "../../components/Home/HomeContent";
import HomeModals from "../../components/Home/HomeModals";
import { useModals } from "../../hooks/useModals";
import { useSessionStorageBoolean } from "../../hooks/useSessionStorage";

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
  } = useModals();
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
      // Delay opening the discount modal by 30 seconds
      const timer = setTimeout(() => {
        openDiscountModal();
      }, 30000); // 30 seconds

      // Cleanup timer on unmount
      return () => clearTimeout(timer);
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
