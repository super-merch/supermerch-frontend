
import { AppContext } from '../context/AppContext'
import React, { useContext, useEffect, useState } from 'react'
import { LuLayoutDashboard, LuShoppingCart, LuMapPin, LuCreditCard, LuMenu, LuX } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import DashBoard from '../userAdmin/DashBoard'
import UserProducts from './UserProducts'
import Adress from './Adress'
import { IoIosLogOut } from "react-icons/io";
import AccountDetail from './AccountDetail'
import { motion } from "framer-motion";

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { id: 'orders', label: 'Orders', icon: LuShoppingCart },
  { id: 'ordersDetails', label: 'OrdersDetails', icon: LuShoppingCart },
  { id: 'address', label: 'Address', icon: LuMapPin },
  { id: 'account', label: 'Account details', icon: LuCreditCard }
]

export default function SidebarTabs() {
  // const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const { activeTab, setActiveTab, handleLogout } = useContext(AppContext);
  // const {   } = useContext(AppContext)


  useEffect(() => {
    if (showLogoutPopup) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [showLogoutPopup]);



  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="w-full p-3 lg:p-5 md:p-5">
      <div className="flex flex-row justify-between bg-white border border-gray-300 shadow-xl ">
        {/* Sidebar */}
        <div
          className={`fixed  z-50 inset-y-0 left-0 max-lg:z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button onClick={toggleSidebar} className="lg:hidden">
              <LuX className="w-6 h-6" />
            </button>
          </div>
          <nav className="mt-4">
            {tabs.map((tab) => (
              <div key={tab.id}>
                {tab.id === 'ordersDetails' ? null : <button

                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsSidebarOpen(false)
                  }}
                  className={`flex items-center w-full px-4 py-3 text-left ${activeTab === tab.id
                    ? 'bg-gray-200'
                    : 'text-black font-semibold hover:bg-gray-100'
                    }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>}
              </div>
            ))}
            <button
              onClick={() => setShowLogoutPopup(true)}
              className="flex items-center gap-1 px-4 py-3 font-semibold text-black transition duration-300 hover:bg-gray-100 lg:w-full text-start"
            >
              <IoIosLogOut className='w-6 h-6 ' />

              Log Out
            </button>
          </nav>

          {/* Main content */}
        </div>
        <div className="flex-1 overflow-auto">
          <div className="">
            <button onClick={toggleSidebar} className="px-4 pt-4 lg:px-10 md:px-10 lg:hidden">
              <LuMenu className="w-6 h-6" />
            </button>
            {activeTab === 'dashboard' && <DashboardContent />}
            {activeTab === 'orders' && <OrdersContent />}
            {activeTab === 'address' && <AddressContent />}
            {activeTab === 'account' && <PaymentsContent />}
            {activeTab === 'ordersDetails' && <OrdersContentDetails />}
          </div>
        </div>



        {/* Logout Confirmation Popup */}
        {showLogoutPopup && (
          <motion.div
            className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-2">
            <motion.div
              initial={{ opacity: 0.2, z: 50 }}
              transition={{ duration: 0.3 }}
              whileInView={{ opacity: 1, z: 0 }}
              viewport={{ once: true }}
              className='flex flex-col w-[100%] sm:max-w-[40%] sm:w-full text-gray-800 justify-center bg-white p-5 rounded-md'>
              <p className='text-sm font-semibold'>Are you sure you want to logout?</p>
              <p className='text-sm text-gray-500'>You can login back at any time. All the changes you've been made will not be lost.</p>
              <div className="flex gap-2 justify-end">
                <button className="px-3 py-1 text-gray-700 transition duration-300 border rounded hover:bg-gray-100" onClick={() => setShowLogoutPopup(false)}>Cancel</button>
                <button onClick={() => {
                  handleLogout();
                  setShowLogoutPopup(false)
                }} className='px-3 py-1 bg-red-600 text-white hover:bg-red-500 rounded transition-all'>Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div >
  )
}

function DashboardContent() {

  return (
    <div>
      <DashBoard />
    </div>
  )
}

function OrdersContent() {
  const { newId, setNewId, activeTab, setActiveTab, userOrder, loading } = useContext(AppContext);

  const handleSetView = (id) => {

    setNewId(id);
    setActiveTab('ordersDetails')
  }

  return (
    <>
      <div className="w-full px-4 pt-0 pb-10 text-xl lg:px-8 md:px-8 lg:pt-6 md:pt-6">
        <h1 className="mt-4 mb-4 text-2xl font-bold text-center">Orders</h1>

        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="ml-4 text-lg font-semibold">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto ">
            <table className="w-full border border-collapse border-gray-200 table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border border-gray-300">
                    Order ID
                  </th>
                  <th className="px-4 py-2 border border-gray-300">
                    Order Date
                  </th>
                  <th className="px-4 py-2 border border-gray-300">Status</th>
                  <th className="px-4 py-2 border border-gray-300">
                    Total Payment
                  </th>
                  <th className="px-4 py-2 border border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {userOrder.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-2 text-center border border-gray-300">
                      {order._id}
                    </td>
                    <td className="px-4 py-2 text-center border border-gray-300">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center border border-gray-300">
                      {order.status}
                    </td>
                    <td className="px-4 py-2 text-center border border-gray-300">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center border border-gray-300">
                      <button
                        className="px-4 py-2 font-medium text-black bg-white rounded shadow-2xl hover:bg-gray-200"
                        onClick={() => { handleSetView(order._id) }}
                      >
                        view
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {
        activeTab === "ordersDetails" && (
          <UserProducts
            handleSetView={handleSetView}
            newId={newId}
          />

        )
      }
    </>
  )
}

function OrdersContentDetails() {
  return (
    <div>
      <UserProducts />
    </div>
  )
}


function AddressContent() {
  return (
    <div>
      <Adress />
    </div>
  )
}

function PaymentsContent() {
  return (
    <div>
      <AccountDetail />
    </div>
  )
}