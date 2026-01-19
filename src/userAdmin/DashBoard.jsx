import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { FaBullseye } from "react-icons/fa";

const DashBoard = () => {
  const {
    backednUrl,
    handleLogout,
    setNewId,
    activeTab,
    setActiveTab,
    userOrder,
    userEmail,
    userStats
  } = useContext(AppContext);
  // const [loading, setLoading] = useState(FaBullseye);
  // useEffect(() => {
  //   const fetchUserEmail = async () => {
  //     try {
  //       setLoading(true);
  //       const token = localStorage.getItem("token");
  //       const { data } = await axios.get(`${backednUrl}/api/auth/user`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       if (data.success) {
  //         setUserEmail(data.email);
  //         setLoading(false);
  //       }
  //       setLoading(false);
  //     } catch (error) {
  //       console.error(
  //         "Error fetching user email:",
  //         error.response?.data || error.message
  //       );
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserEmail();
  // }, []);
  const handleSetView = (id) => {
    setNewId(id);
    setActiveTab("ordersDetails");
  };

  return (
    <>
      <div className="w-full px-4 pt-2 pb-4 text-xl lg:px-8 md:px-8 lg:pt-6 md:pt-6 ">
        {userEmail ? (
          <h1 className="max-sm:text-[17px]">
            Welcome{" "}
            <span className="font-semibold text-black ">{userEmail}</span> (not{" "}
            <span className="font-semibold text-black">{userEmail}? </span>{" "}
            <span
              onClick={handleLogout}
              className="font-semibold text-blue-500 cursor-pointer "
            >
              Log out)
            </span>{" "}
          </h1>
        ) : (
          <h1>User not Logged In.</h1>
        )}

        {/* Dashboard Stats Cards */}
        {userOrder && (
          <div className="w-full  mt-10 pb-8">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-6 mb-8">
              {/* Total Orders Card */}
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {userStats?.totalOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Completed Orders Card */}
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Completed Orders
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {userStats?.deliveredOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Orders Card */}
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Pending Orders
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {userStats?.pendingOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Amount Card */}
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Amount
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      ${userStats?.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userOrder?.slice(0, 5)?.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order?.orderId?.slice(-8)?.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            order?.createdAt || order?.orderDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order?.products?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order?.status === "completed" ||
                              order?.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order?.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          $
                          {(order.total || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <button
                            onClick={() => handleSetView(order._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {userOrder.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 text-center">
                  <p className="text-sm text-gray-500">
                    Showing 5 of {userStats.totalOrders} orders
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashBoard;
