import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const getProductImage = (product) =>
  product.images?.[0] || product.variants?.[0]?.images?.[0] || "";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const keyword = useMemo(
    () => searchParams.get("keyword") || "",
    [searchParams],
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(
          `${apiUrl}/api/products?keyword=${encodeURIComponent(keyword)}&limit=24`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load products");
        }

        setProducts(payload.products || []);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 px-4 md:px-8 lg:px-16 pb-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Shop</h1>
          <p className="text-gray-600">
            {keyword
              ? `Search results for "${keyword}"`
              : "Browse our collection of fitness products and equipment."}
          </p>
        </div>

        <div className="mb-6">
          <input
            value={keyword}
            onChange={(event) => {
              const next = event.target.value;
              setSearchParams(next ? { keyword: next } : {});
            }}
            placeholder="Refine search"
            className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-3xl bg-white shadow-sm overflow-hidden"
              >
                <div className="aspect-4/5 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-6 text-red-600">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-600">
            No products found. Try another keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-3xl bg-white shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="aspect-4/5 bg-gray-100 overflow-hidden">
                  {getProductImage(product) ? (
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-gray-500">
                    {product.brand}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{product.minPrice}
                    </p>
                    <span className="text-xs text-gray-500">
                      {Number(product.rating || 0).toFixed(1)} rating
                    </span>
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

export default Shop;
