import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const getProductImage = (product) =>
  product?.images?.[0] || product?.variants?.[0]?.images?.[0] || "";

const Wishlist = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to load wishlist");
      }

      setWishlistItems(payload.wishlist || []);
      window.dispatchEvent(new Event("vajra-wishlist-changed"));
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load wishlist");
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to remove product");
      }

      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
      setMessage("Removed from wishlist.");
      window.dispatchEvent(new Event("vajra-wishlist-changed"));
      setTimeout(() => setMessage(""), 1800);
    } catch (removeError) {
      setMessage(removeError.message || "Failed to remove product");
      setTimeout(() => setMessage(""), 2200);
    }
  };

  const clearWishlist = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/wishlist`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to clear wishlist");
      }

      setWishlistItems([]);
      setMessage("Wishlist cleared.");
      window.dispatchEvent(new Event("vajra-wishlist-changed"));
      setTimeout(() => setMessage(""), 1800);
    } catch (clearError) {
      setMessage(clearError.message || "Failed to clear wishlist");
      setTimeout(() => setMessage(""), 2200);
    }
  };

  const moveToCart = async (item) => {
    try {
      const variantSku = item.variants?.[0]?.sku;
      if (!variantSku) {
        throw new Error("Variant unavailable for this product");
      }

      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item._id,
          variantSku,
          quantity: 1,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to move to cart");
      }

      await removeFromWishlist(item._id);
      setMessage("Moved to cart.");
      window.dispatchEvent(new Event("vajra-cart-changed"));
      setTimeout(() => setMessage(""), 1800);
    } catch (moveError) {
      setMessage(moveError.message || "Failed to move product");
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
              <Heart className="h-4 w-4 text-[#2b5a53]" />
              <h1 className="text-lg font-semibold text-gray-900">
                Your Wishlist
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#d8e4dc] bg-[#f3f8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#24524b]">
                {wishlistItems.length} products
              </span>
              {wishlistItems.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-600"
                >
                  Clear Wishlist
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-76 animate-pulse rounded-3xl bg-white/90"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-6 text-red-600">
            {error}
          </div>
        ) : wishlistItems.length === 0 ? (
          <section className="rounded-4xl border border-white/80 bg-white/92 p-10 text-center shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#24625c]">
              Wishlist is empty
            </p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              Save products you want to revisit
            </h2>
            <button
              onClick={() => navigate("/shop")}
              className="mt-6 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-400 hover:text-gray-900"
            >
              Browse Products
            </button>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {wishlistItems.map((item) => (
              <article
                key={item._id}
                className="group overflow-hidden rounded-3xl border border-white/80 bg-white/92 shadow-[0_14px_46px_rgba(15,23,42,0.08)]"
              >
                <button
                  onClick={() => navigate(`/product/${item.slug || item._id}`)}
                  className="block w-full overflow-hidden bg-gray-100"
                >
                  {getProductImage(item) ? (
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </button>

                <div className="space-y-3 p-4">
                  <p className="truncate text-xs uppercase tracking-[0.14em] text-gray-500">
                    {item.brand}
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/product/${item.slug || item._id}`)
                    }
                    className="min-h-12 text-left text-lg font-semibold leading-7 text-gray-900 hover:text-[#1c4f48]"
                  >
                    {item.name}
                  </button>

                  <div className="flex items-end justify-between gap-3">
                    <p className="text-xl font-bold text-gray-900">
                      ₹{item.minPrice}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Number(item.rating || 0).toFixed(1)} rating
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => moveToCart(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d0dbd4] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-700 transition hover:border-lime-400 hover:bg-lime-50"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
