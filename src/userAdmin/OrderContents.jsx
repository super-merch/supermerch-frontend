import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import UserProducts from "./UserProducts";

export default function OrdersContent() {
    const { userOrder, loading, loadUserOrder, userStats } =
        useContext(AuthContext);
    const { newId, setNewId, activeTab, setActiveTab } = useContext(AppContext);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = userStats?.pages;
    useEffect(() => {
        loadUserOrder(currentPage, 10);
    }, [currentPage]);

    const handleSetView = (id) => {
        setNewId(id);
        setActiveTab("ordersDetails");
        window.location.hash = "#ordersDetails";
    };

    return (
        <>
            <div className="w-full px-3 pt-0 pb-10 lg:px-8 md:px-6 lg:pt-6 space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="ml-3 text-sm font-medium text-gray-600">Loading orders...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Your complete order history.
                                </p>
                            </div>
                            {userOrder.length > 0 && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                    {userOrder.length} of {userStats?.totalOrders ?? 0} orders
                                </span>
                            )}
                        </div>
                        {userOrder.length > 0 ? (
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
                                            {userOrder.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td onClick={() => handleSetView(order._id)} className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 cursor-pointer">
                                                        #{order?.orderId?.slice(-8)?.toUpperCase() || order.orderId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${order?.status === "completed" || order?.status === "delivered"
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
                                                        ${(order.total || 0).toLocaleString("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleSetView(order._id)}
                                                            className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                                        >
                                                            View details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                        <p className="text-sm text-gray-600">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-500 text-sm">
                                No orders found. Once you place an order, it will appear here.
                            </div>
                        )}
                    </div>
                )}
            </div>
            {activeTab === "ordersDetails" && (
                <UserProducts handleSetView={handleSetView} newId={newId} />
            )}
        </>
    );
}
