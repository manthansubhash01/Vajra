import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewReturnForm, setShowNewReturnForm] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [description, setDescription] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const returnReasons = [
    "Defective Product",
    "Wrong Item Received",
    "Size/Color Issue",
    "Quality Not as Expected",
    "Changed Mind",
    "Better Price Elsewhere",
    "Product Damaged",
    "Not as Described",
    "Other",
  ];

  useEffect(() => {
    fetchReturns();
    const orderId = searchParams.get("orderId");
    if (orderId) {
      fetchOrderForReturn(orderId);
    }
  }, [searchParams]);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${apiUrl}/api/returns/user/my-returns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReturns(data.returns || []);
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderForReturn = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
        setShowNewReturnForm(true);
        // Initialize all items as selected
        setSelectedItems(
          data.order.items.map((item) => ({
            productId: item.product._id,
            variantSku: item.variantSku,
            quantity: item.quantity,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    if (!returnReason || selectedItems.length === 0) {
      alert("Please select items and provide a reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${apiUrl}/api/returns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          items: selectedItems,
          returnReason,
          description,
          returnType: "Refund",
        }),
      });

      if (response.ok) {
        alert("Return request submitted successfully!");
        setShowNewReturnForm(false);
        setSelectedOrder(null);
        setReturnReason("");
        setDescription("");
        setSelectedItems([]);
        navigate("/returns");
        fetchReturns();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to submit return request");
      }
    } catch (error) {
      console.error("Error submitting return:", error);
      alert("Failed to submit return request");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Requested: "bg-yellow-100 text-yellow-800",
      Approved: "bg-blue-100 text-blue-800",
      Rejected: "bg-red-100 text-red-800",
      "Pickup Scheduled": "bg-purple-100 text-purple-800",
      "Picked Up": "bg-indigo-100 text-indigo-800",
      "Refund Processing": "bg-orange-100 text-orange-800",
      Refunded: "bg-green-100 text-green-800",
      Completed: "bg-green-200 text-green-900",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (showNewReturnForm && selectedOrder) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 px-4 md:px-8 lg:px-16 max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => {
                setShowNewReturnForm(false);
                navigate("/returns");
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Returns</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Return Request
            </h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-semibold">
                #{selectedOrder._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-6">
              {/* Items Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Items to Return
                </label>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 border rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.some(
                          (si) =>
                            si.productId === item.product._id &&
                            si.variantSku === item.variantSku,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([
                              ...selectedItems,
                              {
                                productId: item.product._id,
                                variantSku: item.variantSku,
                                quantity: item.quantity,
                              },
                            ]);
                          } else {
                            setSelectedItems(
                              selectedItems.filter(
                                (si) =>
                                  !(
                                    si.productId === item.product._id &&
                                    si.variantSku === item.variantSku
                                  ),
                              ),
                            );
                          }
                        }}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          SKU: {item.variantSku} | Qty: {item.quantity} | ₹
                          {item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Provide additional details about the return..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Submit Return Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewReturnForm(false);
                    navigate("/returns");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 px-4 md:px-8 lg:px-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Loading returns...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Returns & Refunds
            </h1>
            <p className="text-gray-600">
              Track and manage your return requests
            </p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Orders
          </button>
        </div>

        {returns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No return requests
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't created any return requests yet
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View Your Orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((returnRequest) => (
              <div
                key={returnRequest._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Return #{returnRequest._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested on{" "}
                        {new Date(returnRequest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnRequest.status)}`}
                    >
                      {returnRequest.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Reason:</p>
                    <p className="text-gray-600">
                      {returnRequest.returnReason}
                    </p>
                    {returnRequest.description && (
                      <>
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          Details:
                        </p>
                        <p className="text-gray-600">
                          {returnRequest.description}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {returnRequest.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        Refund Amount: ₹{returnRequest.refundAmount}
                      </p>
                      {returnRequest.pickupDate && (
                        <p className="text-sm text-gray-500">
                          Pickup:{" "}
                          {new Date(
                            returnRequest.pickupDate,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {returnRequest.status === "Requested" && (
                      <button
                        onClick={() => {
                          // Cancel return logic here
                          console.log("Cancel return:", returnRequest._id);
                        }}
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
                      >
                        Cancel Return
                      </button>
                    )}
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Status Timeline
                    </p>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${returnRequest.status === "Requested" ? "bg-yellow-500" : "bg-green-500"}`}
                      ></div>
                      <span className="text-sm text-gray-600">Requested</span>
                      <div className="flex-1 h-0.5 bg-gray-300"></div>
                      <div
                        className={`w-3 h-3 rounded-full ${["Approved", "Pickup Scheduled", "Picked Up", "Refund Processing", "Refunded", "Completed"].includes(returnRequest.status) ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      <span className="text-sm text-gray-600">Approved</span>
                      <div className="flex-1 h-0.5 bg-gray-300"></div>
                      <div
                        className={`w-3 h-3 rounded-full ${["Picked Up", "Refund Processing", "Refunded", "Completed"].includes(returnRequest.status) ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      <span className="text-sm text-gray-600">Picked Up</span>
                      <div className="flex-1 h-0.5 bg-gray-300"></div>
                      <div
                        className={`w-3 h-3 rounded-full ${["Refunded", "Completed"].includes(returnRequest.status) ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      <span className="text-sm text-gray-600">Refunded</span>
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

export default Returns;
