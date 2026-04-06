import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const getProductImage = (product, variantSku) => {
  const variantImage = product?.variants?.find(
    (item) => item.sku === variantSku,
  )?.images?.[0];
  return (
    variantImage ||
    product?.images?.[0] ||
    product?.variants?.[0]?.images?.[0] ||
    ""
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to load cart");
      }

      setCartItems(payload.cart || []);
      window.dispatchEvent(new Event("vajra-cart-changed"));
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load cart");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const variantPrice =
          item.product?.variants?.find(
            (variant) => variant.sku === item.variantSku,
          )?.price ||
          item.product?.minPrice ||
          0;
        return total + Number(variantPrice) * Number(item.quantity || 1);
      }, 0),
    [cartItems],
  );

  const updateQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(
        `${apiUrl}/api/cart/${item.product?._id}/${encodeURIComponent(item.variantSku)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: nextQuantity }),
        },
      );

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Failed to update quantity");
      }

      setCartItems(payload.cart || []);
      window.dispatchEvent(new Event("vajra-cart-changed"));
    } catch (updateError) {
      setMessage(updateError.message || "Could not update quantity");
      setTimeout(() => setMessage(""), 2200);
    }
  };

  const removeItem = async (item) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(
        `${apiUrl}/api/cart/${item.product?._id}/${encodeURIComponent(item.variantSku)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to remove item");
      }

      setCartItems(payload.cart || []);
      setMessage("Item removed from cart.");
      window.dispatchEvent(new Event("vajra-cart-changed"));
      setTimeout(() => setMessage(""), 1800);
    } catch (removeError) {
      setMessage(removeError.message || "Failed to remove item");
      setTimeout(() => setMessage(""), 2200);
    }
  };

  const clearCart = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to clear cart");
      }

      setCartItems([]);
      setMessage("Cart cleared.");
      window.dispatchEvent(new Event("vajra-cart-changed"));
      setTimeout(() => setMessage(""), 1800);
    } catch (clearError) {
      setMessage(clearError.message || "Failed to clear cart");
      setTimeout(() => setMessage(""), 2200);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#edf2ef] via-[#edf3f2] to-[#e7eef4]">
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-22 md:px-6 lg:px-8">
        <section className="mb-4 rounded-3xl border border-white/85 bg-white/84 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#2b5a53]" />
              <h1 className="text-lg font-semibold text-gray-900">Your Cart</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#d8e4dc] bg-[#f3f8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#24524b]">
                {cartItems.length} items
              </span>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-600"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </section>

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="h-72 animate-pulse rounded-4xl bg-white/90" />
            <div className="h-72 animate-pulse rounded-4xl bg-white/90" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-6 text-red-600">
            {error}
          </div>
        ) : cartItems.length === 0 ? (
          <section className="rounded-4xl border border-white/80 bg-white/92 p-10 text-center shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#24625c]">
              Cart is empty
            </p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              No products added yet
            </h2>
            <button
              onClick={() => navigate("/shop")}
              className="mt-6 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-400 hover:text-gray-900"
            >
              Explore Products
            </button>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                const unitPrice =
                  product?.variants?.find(
                    (variant) => variant.sku === item.variantSku,
                  )?.price ||
                  product?.minPrice ||
                  0;

                return (
                  <article
                    key={`${product?._id}-${item.variantSku}`}
                    className="rounded-3xl border border-white/80 bg-white/92 p-4 shadow-[0_14px_44px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <button
                        onClick={() =>
                          navigate(`/product/${product?.slug || product?._id}`)
                        }
                        className="h-32 w-full overflow-hidden rounded-2xl bg-gray-100 sm:w-32"
                      >
                        {getProductImage(product, item.variantSku) ? (
                          <img
                            src={getProductImage(product, item.variantSku)}
                            alt={product?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs uppercase tracking-[0.14em] text-gray-500">
                          {product?.brand}
                        </p>
                        <button
                          onClick={() =>
                            navigate(
                              `/product/${product?.slug || product?._id}`,
                            )
                          }
                          className="mt-1 text-left text-lg font-semibold text-gray-900 hover:text-[#1c4f48]"
                        >
                          {product?.name}
                        </button>

                        <p className="mt-1 text-sm text-gray-600">
                          SKU: {item.variantSku}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-[#d5dfd8] bg-[#f7fbf8]">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item,
                                  Number(item.quantity || 1) - 1,
                                )
                              }
                              className="rounded-l-full px-3 py-1.5 text-gray-700"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 text-sm font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item,
                                  Number(item.quantity || 1) + 1,
                                )
                              }
                              className="rounded-r-full px-3 py-1.5 text-gray-700"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="text-lg font-bold text-gray-900">
                            ₹{Number(unitPrice) * Number(item.quantity || 1)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item)}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-white/80 bg-white/92 p-5 shadow-[0_14px_44px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#24625c]">
                Order Summary
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Items ({cartItems.length})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span className="text-emerald-700">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>₹{subtotal}</span>
                  </div>
                </div>
              </div>

              <button className="mt-5 w-full rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-lime-400 hover:text-gray-900">
                Proceed To Checkout
              </button>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
};

export default Cart;
