import { createContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserCartItems } from "@/redux/slices/cartSlice";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [gstCharges, setGstCharges] = useState(10);
  const [shippingCharges, setShippingCharges] = useState(20);
  const [setupFee, setSetupFee] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newId, setNewId] = useState(null);

  const items = useSelector(selectCurrentUserCartItems);

  useEffect(() => {
    const setup = items.reduce(
      (total, item) => total + (item.setupFee || 0),
      0
    );
    setSetupFee(setup);
  }, [items]);

  useEffect(() => {
    const getShippingCharges = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/shipping/get`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        setShippingCharges(data.shipping || 20);
        setGstCharges(data.gst || 10);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch shipping charges");
        }
      } catch (error) {
        console.error("Failed to fetch shipping charges:", error);
      }
    };

    getShippingCharges();
  }, []);

  const value = {
    backendUrl,
    activeTab,
    setActiveTab,
    newId,
    setNewId,
    openLoginModal,
    setOpenLoginModal,
    shippingCharges,
    gstCharges,
    setupFee,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export { AppContextProvider };
