import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${apiUrl}/api/orders/user/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Shipped: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const canReturn = (order) => {
    if (order.orderStatus !== "Delivered") return false;
    const deliveredDate = new Date(order.deliveredAt);
    const daysSince = Math.floor(
      (new Date() - deliveredDate) / (1000 * 60 * 60 * 24),
    );
    return daysSince <= 7;
  };

  const handleReturnClick = (orderId) => {
    navigate(`/returns/new?orderId=${orderId}`);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 px-4 md:px-8 lg:px-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Loading orders...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Image</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            SKU: {item.variantSku}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        Total: ₹{order.totalAmount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Payment: {order.paymentMethod}
                      </p>
                    </div>
                    <div className="space-x-3">
                      {canReturn(order) && (
                        <button
                          onClick={() => handleReturnClick(order._id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                          Return Order
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
