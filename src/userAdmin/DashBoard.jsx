import React, { useContext,  } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";

const DashBoard = () => {
  const {  userOrder, userEmail, userStats } =
    useContext(AuthContext);
  const { setNewId, setActiveTab } = useContext(AppContext);

  // const [loading, setLoading] = useState(FaBullseye);
  // useEffect(() => {
  //   const fetchUserEmail = async () => {
  //     try {
  //       setLoading(true);
  //       const token = localStorage.getItem("token");
  //       const { data } = await axios.get(`${backendUrl}/api/auth/user`, {
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
      <div className="w-full px-4 pt-4 pb-8 lg:px-8 md:px-8 lg:pt-6 space-y-6">
        {/* Welcome / Profile summary */}
        {/* <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Welcome back
            </p>
            {userEmail ? (
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {userEmail}
              </h1>
            ) : (
              <h1 className="text-xl font-semibold text-gray-900">
                User not logged in
              </h1>
            )}
            <p className="mt-1 text-sm text-gray-500">
              View your recent activity, orders and account overview in one place.
            </p>
          </div>

          {userEmail && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors"
            >
              Log out
            </button>
          )}
        </div> */}

        {/* Dashboard Stats Cards */}
        {userOrder && (
          <div className="w-full space-y-6">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
              {/* Total Orders Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 px-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Orders
                  </p>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                <p className="text-3xl font-bold text-gray-900">
                  {userStats?.totalOrders ?? 0}
                </p>
                <p className="text-xs text-gray-500">
                  All orders you’ve placed with us.
                </p>
              </div>

              {/* Completed Orders Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 px-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Completed
                  </p>
                  <div className="p-2 bg-green-50 rounded-full">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                <p className="text-3xl font-bold text-gray-900">
                  {userStats?.deliveredOrders ?? 0}
                </p>
                <p className="text-xs text-gray-500">
                  Successfully delivered orders.
                </p>
              </div>

              {/* Pending Orders Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 px-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    In Progress
                  </p>
                  <div className="p-2 bg-amber-50 rounded-full">
                    <svg
                      className="w-5 h-5 text-amber-600"
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
                <p className="text-3xl font-bold text-gray-900">
                  {userStats?.pendingOrders ?? 0}
                </p>
                <p className="text-xs text-gray-500">
                  Orders currently being processed.
                </p>
              </div>

              {/* Total Amount Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 px-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Spent
                  </p>
                  <div className="p-2 bg-purple-50 rounded-full">
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
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {(userStats?.totalSpent ?? 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Total value of all completed orders.
                </p>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h3>
                  <p className="text-xs text-gray-500">
                    A quick snapshot of your latest activity.
                  </p>
                </div>
                {userOrder?.length > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    {userOrder.length} total orders
                  </span>
                )}
              </div>
              {userOrder?.length ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
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
                        {userOrder?.slice(0, 5).map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td onClick={() => handleSetView(order._id)} className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 cursor-pointer">
                              #{order?.orderId?.slice(-8)?.toUpperCase()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              {new Date(
                                order?.createdAt || order?.orderDate
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              {order?.products?.length || 0} items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${order?.status === "completed" ||
                                  order?.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order?.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                  }`}
                              >
                                {order.status || "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              $
                              {(order.total || 0).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleSetView(order._id)}
                                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                              >
                                View details
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
                        Showing 5 of {userStats?.totalOrders ?? 0} orders. Go to{" "}
                        <span className="font-semibold text-indigo-600">
                          Orders
                        </span>{" "}
                        tab for full history.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-6 py-10 text-center text-gray-500 text-sm">
                  You don’t have any orders yet. Once you place an order, it
                  will appear here.
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
