import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const getProductImage = (product) =>
  product.images?.[0] || product.variants?.[0]?.images?.[0] || "";

const variantFacetKeys = ["size", "color", "flavor", "material", "weight"];

const normalizeFacetKey = (key = "") =>
  key
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getProductFacetMap = (product) => {
  const map = new Map();

  if (product.attributes) {
    Object.entries(product.attributes).forEach(([key, rawValue]) => {
      const value = String(rawValue || "").trim();
      if (!value) {
        return;
      }

      const facetKey = `attr:${key}`;
      const existing = map.get(facetKey) || new Set();
      existing.add(value);
      map.set(facetKey, existing);
    });
  }

  (product.variants || []).forEach((variant) => {
    variantFacetKeys.forEach((key) => {
      const value = String(variant[key] || "").trim();
      if (!value) {
        return;
      }

      const facetKey = `variant:${key}`;
      const existing = map.get(facetKey) || new Set();
      existing.add(value);
      map.set(facetKey, existing);
    });
  });

  return map;
};

const buildDynamicFacets = (items) => {
  const facetMap = new Map();

  items.forEach((product) => {
    const productFacets = getProductFacetMap(product);

    productFacets.forEach((values, facetKey) => {
      if (!facetMap.has(facetKey)) {
        facetMap.set(facetKey, new Map());
      }

      const counter = facetMap.get(facetKey);
      values.forEach((value) => {
        counter.set(value, (counter.get(value) || 0) + 1);
      });
    });
  });

  return Array.from(facetMap.entries())
    .map(([facetKey, valuesMap]) => ({
      key: facetKey,
      label: normalizeFacetKey(facetKey.split(":")[1]),
      values: Array.from(valuesMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    }))
    .filter((facet) => facet.values.length > 1)
    .sort((a, b) => a.label.localeCompare(b.label));
};

const computeDiscountPercent = (product) => {
  const min = Number(product.minPrice || 0);
  const max = Number(product.maxPrice || 0);

  if (!min || !max || max <= min) {
    return 0;
  }

  return Math.round(((max - min) / max) * 100);
};

const discountThresholds = [10, 20, 30, 40, 50];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [correctedKeyword, setCorrectedKeyword] = useState(null);
  const [hideCorrection, setHideCorrection] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedDynamic, setSelectedDynamic] = useState({});
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedPrice, setSelectedPrice] = useState([0, 0]);

  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const keyword = useMemo(
    () => searchParams.get("keyword") || "",
    [searchParams],
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        setCorrectedKeyword(null);
        setHideCorrection(false);
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(
          `${apiUrl}/api/products?keyword=${encodeURIComponent(keyword)}&limit=40`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load products");
        }

        setProducts(payload.products || []);
        setCorrectedKeyword(payload.correctedKeyword || null);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  const priceBounds = useMemo(() => {
    if (!products.length) {
      return [0, 0];
    }

    const prices = products.map((item) => Number(item.minPrice || 0));
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  useEffect(() => {
    setSelectedPrice(priceBounds);
  }, [priceBounds]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((item) => item.category).filter(Boolean)),
      ).sort(),
    [products],
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(products.map((item) => item.brand).filter(Boolean)),
      ).sort(),
    [products],
  );

  const genders = useMemo(
    () =>
      Array.from(
        new Set(products.map((item) => item.gender).filter(Boolean)),
      ).sort(),
    [products],
  );

  const dynamicFacets = useMemo(() => buildDynamicFacets(products), [products]);

  const toggleValue = (current, setter, value) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const toggleDynamicFacetValue = (facetKey, value) => {
    setSelectedDynamic((prev) => {
      const list = prev[facetKey] || [];
      const nextList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];

      if (!nextList.length) {
        const { [facetKey]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [facetKey]: nextList,
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedGenders([]);
    setSelectedDynamic({});
    setSelectedDiscount(0);
    setSortBy("relevance");
    setSelectedPrice(priceBounds);
  };

  const filteredProducts = useMemo(() => {
    const [minSelectedPrice, maxSelectedPrice] = selectedPrice;

    const dynamicFacetKeys = Object.keys(selectedDynamic);

    const filtered = products.filter((product) => {
      const productPrice = Number(product.minPrice || 0);

      if (
        selectedCategories.length &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }

      if (selectedBrands.length && !selectedBrands.includes(product.brand)) {
        return false;
      }

      if (selectedGenders.length && !selectedGenders.includes(product.gender)) {
        return false;
      }

      if (productPrice < minSelectedPrice || productPrice > maxSelectedPrice) {
        return false;
      }

      if (selectedDiscount > 0) {
        const discount = computeDiscountPercent(product);
        if (discount < selectedDiscount) {
          return false;
        }
      }

      if (dynamicFacetKeys.length) {
        const productFacetMap = getProductFacetMap(product);

        const dynamicMatch = dynamicFacetKeys.every((facetKey) => {
          const selectedValues = selectedDynamic[facetKey] || [];
          if (!selectedValues.length) {
            return true;
          }

          const productValues = productFacetMap.get(facetKey);
          if (!productValues) {
            return false;
          }

          return selectedValues.some((value) => productValues.has(value));
        });

        if (!dynamicMatch) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered];

    if (sortBy === "price-low") {
      sorted.sort((a, b) => Number(a.minPrice || 0) - Number(b.minPrice || 0));
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => Number(b.minPrice || 0) - Number(a.minPrice || 0));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "discount") {
      sorted.sort(
        (a, b) => computeDiscountPercent(b) - computeDiscountPercent(a),
      );
    }

    return sorted;
  }, [
    products,
    selectedCategories,
    selectedBrands,
    selectedGenders,
    selectedPrice,
    selectedDiscount,
    selectedDynamic,
    sortBy,
  ]);

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedGenders.length +
    Object.values(selectedDynamic).reduce(
      (total, list) => total + list.length,
      0,
    ) +
    (selectedDiscount > 0 ? 1 : 0);

  const runMemberAction = async (intent, product) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: {
            pathname: intent === "buy" ? "/cart" : `/shop?keyword=${keyword}`,
          },
          reason: "auth",
        },
      });
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";

      if (intent === "wishlist") {
        const response = await fetch(`${apiUrl}/api/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Failed to add to wishlist");
        }

        setActionMessage(`${product.name} saved to wishlist.`);
        window.dispatchEvent(new Event("vajra-wishlist-changed"));
      } else {
        const variantSku = product.variants?.[0]?.sku;

        if (!variantSku) {
          throw new Error("Variant unavailable for this product");
        }

        const response = await fetch(`${apiUrl}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            variantSku,
            quantity: 1,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Failed to add to cart");
        }

        window.dispatchEvent(new Event("vajra-cart-changed"));

        if (intent === "buy") {
          navigate("/cart");
          return;
        }

        setActionMessage(`${product.name} added to cart.`);
      }
    } catch (actionError) {
      setActionMessage(actionError.message || "Action failed");
    }

    setTimeout(() => setActionMessage(""), 2400);
  };

  const filterPanel = (
    <aside className="space-y-5">
      <div className="rounded-3xl border border-[#dbe5dd] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#214f49]">
            Filters
          </h2>
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2d6760] hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-900">Price</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <input
                type="number"
                value={selectedPrice[0]}
                min={priceBounds[0]}
                max={selectedPrice[1]}
                onChange={(event) =>
                  setSelectedPrice([
                    Math.min(Number(event.target.value || 0), selectedPrice[1]),
                    selectedPrice[1],
                  ])
                }
                className="rounded-xl border border-gray-300 px-3 py-2"
              />
              <input
                type="number"
                value={selectedPrice[1]}
                min={selectedPrice[0]}
                max={priceBounds[1]}
                onChange={(event) =>
                  setSelectedPrice([
                    selectedPrice[0],
                    Math.max(Number(event.target.value || 0), selectedPrice[0]),
                  ])
                }
                className="rounded-xl border border-gray-300 px-3 py-2"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Range: ₹{priceBounds[0]} - ₹{priceBounds[1]}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-900">Discount</p>
            <div className="space-y-2">
              {discountThresholds.map((threshold) => (
                <label
                  key={threshold}
                  className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    checked={selectedDiscount === threshold}
                    onChange={() => setSelectedDiscount(threshold)}
                  />
                  {threshold}% and above
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked={selectedDiscount === 0}
                  onChange={() => setSelectedDiscount(0)}
                />
                All discounts
              </label>
            </div>
          </div>

          {[
            {
              label: "Category",
              values: categories,
              selected: selectedCategories,
              setter: setSelectedCategories,
            },
            {
              label: "Brand",
              values: brands,
              selected: selectedBrands,
              setter: setSelectedBrands,
            },
            {
              label: "Gender",
              values: genders,
              selected: selectedGenders,
              setter: setSelectedGenders,
            },
          ].map((section) => (
            <div key={section.label}>
              <p className="mb-2 text-sm font-semibold text-gray-900">
                {section.label}
              </p>
              <div className="max-h-44 space-y-2 overflow-auto pr-1">
                {section.values.map((value) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={section.selected.includes(value)}
                      onChange={() =>
                        toggleValue(section.selected, section.setter, value)
                      }
                    />
                    <span className="capitalize">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {dynamicFacets.map((facet) => (
            <div key={facet.key}>
              <p className="mb-2 text-sm font-semibold text-gray-900">
                {facet.label}
              </p>
              <div className="max-h-44 space-y-2 overflow-auto pr-1">
                {facet.values.slice(0, 12).map((item) => (
                  <label
                    key={`${facet.key}:${item.value}`}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={(selectedDynamic[facet.key] || []).includes(
                        item.value,
                      )}
                      onChange={() =>
                        toggleDynamicFacetValue(facet.key, item.value)
                      }
                    />
                    <span className="truncate">
                      {item.value} ({item.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-[#edf2ef] via-[#edf3f2] to-[#e7eef4]">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 pb-18 pt-20 md:px-6 lg:px-8">
        <section className="mb-3 rounded-2xl border border-white/80 bg-white/84 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {keyword && correctedKeyword && !hideCorrection ? (
                <>
                  <p className="text-sm text-gray-700">
                    Showing results for{" "}
                    <strong className="font-semibold text-gray-900">
                      {correctedKeyword}
                    </strong>
                  </p>
                  <button
                    onClick={() => setHideCorrection(true)}
                    className="mt-0.5 text-xs text-[#2d6760] hover:underline"
                  >
                    Search instead for &quot;{keyword}&quot;
                  </button>
                </>
              ) : (
                <p className="text-sm font-semibold text-gray-700">
                  {keyword ? `Results for "${keyword}"` : "All products"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#d8e4dc] bg-[#f3f8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#24524b]">
                {filteredProducts.length} products
              </span>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#d2dfd7] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#244944] lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters ({activeFilterCount})
              </button>
            </div>
          </div>
        </section>

        {!isAuthenticated && (
          <div className="mb-5 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-[#21504d]">
            Browse as guest anytime. Login to add items to cart, wishlist, and
            checkout.
          </div>
        )}

        {actionMessage && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {actionMessage}
          </div>
        )}

        <section className="mb-4 rounded-2xl border border-white/80 bg-white/84 p-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:p-3">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              value={keyword}
              onChange={(event) => {
                const next = event.target.value;
                setSearchParams(next ? { keyword: next } : {});
              }}
              placeholder="Refine search"
              className="w-full rounded-xl border border-[#d9e4dc] bg-[#f9fcfa] px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-xl border border-[#d9e4dc] bg-[#f9fcfa] px-4 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Sort: Price Low to High</option>
              <option value="price-high">Sort: Price High to Low</option>
              <option value="rating">Sort: Rating</option>
              <option value="discount">Sort: Best Discount</option>
            </select>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[290px_1fr]">
          <div className="hidden lg:block">{filterPanel}</div>

          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="aspect-4/5 animate-pulse bg-gray-200"></div>
                    <div className="space-y-2 p-4">
                      <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-white p-6 text-red-600">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                No products match selected filters. Try clearing a few filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product._id}
                    className="group overflow-hidden rounded-3xl border border-white/80 bg-white/92 shadow-[0_14px_46px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_58px_rgba(15,23,42,0.14)]"
                  >
                    <button
                      onClick={() =>
                        navigate(`/product/${product.slug || product._id}`)
                      }
                      className="block w-full text-left"
                    >
                      <div className="aspect-[4/4.2] overflow-hidden bg-gray-100">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-gray-500">
                        <span className="truncate">{product.brand}</span>
                        <span className="rounded-full bg-[#f2f7f4] px-2 py-1 text-[10px] font-semibold capitalize text-[#23554f]">
                          {product.category}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/product/${product.slug || product._id}`)
                        }
                        className="block w-full text-left"
                      >
                        <h3 className="min-h-14 text-lg font-semibold leading-7 text-gray-900 line-clamp-2 hover:text-[#1c4f48]">
                          {product.name}
                        </h3>
                      </button>

                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{product.minPrice}
                          </p>
                          {Number(product.maxPrice || 0) >
                            Number(product.minPrice || 0) && (
                            <p className="text-xs text-emerald-700">
                              {computeDiscountPercent(product)}% off
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {Number(product.rating || 0).toFixed(1)} rating
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => runMemberAction("wishlist", product)}
                          className="rounded-full border border-gray-300 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-700 transition hover:border-lime-400 hover:bg-lime-50"
                        >
                          Wishlist
                        </button>
                        <button
                          onClick={() => runMemberAction("cart", product)}
                          className="rounded-full border border-gray-300 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-700 transition hover:border-lime-400 hover:bg-lime-50"
                        >
                          Add Cart
                        </button>
                        <button
                          onClick={() => runMemberAction("buy", product)}
                          className="rounded-full bg-gray-900 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-lime-400 hover:text-gray-900"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {showMobileFilters && (
        <div className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-[380px] overflow-y-auto bg-[#f3f7f4] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#24524b]">
                Filter Products
              </p>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full border border-[#d5e0d8] bg-white p-2 text-[#274943]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {filterPanel}

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-4 w-full rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
