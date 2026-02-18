import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import React, { useContext, useEffect, useState } from "react";
import {
  LuLayoutDashboard,
  LuShoppingCart,
  LuMapPin,
  LuCreditCard,
  LuMenu,
  LuX,
  LuAlertCircle,
} from "react-icons/lu";
import { useLocation } from "react-router-dom";
import DashBoard from "../userAdmin/DashBoard";
import UserProducts from "./UserProducts";
import Adress from "./Adress";
import { IoIosLogOut } from "react-icons/io";
import { googleLogout } from "@react-oauth/google";
import AccountDetail from "./AccountDetail";
import { motion } from "framer-motion";
import OrdersContent from "./OrderContents";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { id: "orders", label: "Orders", icon: LuShoppingCart },
  { id: "ordersDetails", label: "OrdersDetails", icon: LuShoppingCart },
  { id: "address", label: "Address", icon: LuMapPin },
  { id: "account", label: "Account details", icon: LuCreditCard },
];

export default function SidebarTabs() {
  // const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const location = useLocation();

  const { activeTab, setActiveTab } = useContext(AppContext);
  const { handleLogout } = useContext(AuthContext);

  // Sync activeTab with URL hash on mount and when hash changes
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    const validTabs = ['dashboard', 'orders', 'address', 'account', 'ordersDetails'];

    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    } else if (!hash) {
      // Default to dashboard if no hash
      setActiveTab('dashboard');
      window.location.hash = '#dashboard';
    }
  }, [location.hash, setActiveTab]);

  useEffect(() => {
    if (showLogoutPopup) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [showLogoutPopup]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const activeTabMeta =
    tabs.find((t) => t.id === activeTab) || tabs.find((t) => t.id === "dashboard");
  const activeTitle = activeTabMeta?.label || "Dashboard";
  const showBackToOrders = activeTab === "ordersDetails";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 lg:hidden"
        />
      )}

      <div className="w-full ">
        <div className="flex min-h-[calc(100vh-24px)] lg:min-h-[calc(100vh-48px)] bg-white shadow-sm overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            aria-label="Dashboard navigation"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">My Account</span>
                <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-2">
              {tabs
                .filter((t) => t.id !== "ordersDetails")
                .map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        window.location.hash = `#${tab.id}`;
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-gray-800 hover:bg-gray-100"
                        }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}

              <div className="my-3 border-t border-gray-200" />

              <button
                onClick={() => setShowLogoutPopup(true)}
                className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-left text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <IoIosLogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Log out</span>
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200">
              <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Open menu"
                  >
                    <LuMenu className="w-6 h-6" />
                  </button>

                  <div>
                    <p className="text-xs text-gray-500">Account</p>
                    <h1 className="text-lg font-bold text-gray-900">
                      {activeTitle}
                    </h1>
                  </div>
                </div>

                {showBackToOrders && (
                  <button
                    onClick={() => {
                      setActiveTab("orders");
                      window.location.hash = "#orders";
                    }}
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Back to Orders
                  </button>
                )}
              </div>
            </div>

            <div className="p-2 py-1">
              {activeTab === "dashboard" && <DashBoard />}
              {activeTab === "orders" && <OrdersContent />}
              {activeTab === "address" && <Adress />}
              {activeTab === "account" && <AccountDetail />}
              {activeTab === "ordersDetails" && <UserProducts />}
            </div>
          </div>

          {/* Logout Confirmation Modal */}
          {showLogoutPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowLogoutPopup(false)}
                aria-hidden="true"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-modal-title"
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <LuAlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3
                      id="logout-modal-title"
                      className="text-xl font-bold text-gray-900"
                    >
                      Confirm Logout
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLogoutPopup(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <LuX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    Are you sure you want to log out? You can log back in at any
                    time. All your changes have been saved.
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowLogoutPopup(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowLogoutPopup(false);
                    }}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Log Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




