import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const OPTION_KEYS = [
  "size",
  "color",
  "flavor",
  "weight",
  "material",
  "resistance_level",
];

const getProductImage = (product) =>
  product?.images?.[0] || product?.variants?.[0]?.images?.[0] || "";

const toTitle = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getAllImages = (product, selectedVariant) => {
  const list = [
    ...(selectedVariant?.images || []),
    ...(product?.images || []),
    ...(product?.variants || []).flatMap((variant) => variant.images || []),
  ].filter(Boolean);

  return Array.from(new Set(list));
};

const buildOptionsMeta = (variants = []) => {
  const map = new Map();

  variants.forEach((variant) => {
    OPTION_KEYS.forEach((key) => {
      const value = String(variant[key] || "").trim();
      if (!value) return;

      if (!map.has(key)) {
        map.set(key, new Set());
      }
      map.get(key).add(value);
    });
  });

  return Array.from(map.entries()).map(([key, values]) => ({
    key,
    label: toTitle(key),
    values: Array.from(values),
  }));
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(
          `${apiUrl}/api/products/${encodeURIComponent(slug || "")}`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load product details");
        }

        const loadedProduct = payload.product || null;
        const variants = loadedProduct?.variants || [];
        const firstVariant = variants[0] || null;

        setProduct(loadedProduct);
        setRelatedProducts(payload.relatedProducts || []);
        setSelectedImage(getAllImages(loadedProduct, firstVariant)[0] || "");
        setQuantity(1);

        const initialOptions = {};
        OPTION_KEYS.forEach((key) => {
          if (firstVariant?.[key]) {
            initialOptions[key] = firstVariant[key];
          }
        });
        setSelectedOptions(initialOptions);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;

    const matched = product.variants.find((variant) =>
      Object.entries(selectedOptions).every(([key, value]) => {
        if (!value) return true;
        return String(variant[key] || "") === String(value);
      }),
    );

    return matched || product.variants[0];
  }, [product, selectedOptions]);

  useEffect(() => {
    if (!selectedVariant) return;
    const variantImage = selectedVariant.images?.[0];
    if (variantImage) {
      setSelectedImage(variantImage);
    }
  }, [selectedVariant]);

  const imageGallery = useMemo(
    () => getAllImages(product, selectedVariant),
    [product, selectedVariant],
  );

  const optionsMeta = useMemo(
    () => buildOptionsMeta(product?.variants || []),
    [product],
  );

  const currentPrice = Number(selectedVariant?.price || product?.minPrice || 0);
  const listPrice = Number(product?.maxPrice || currentPrice || 0);
  const discount =
    listPrice > currentPrice
      ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
      : 0;
  const stock = Number(selectedVariant?.stock ?? 0);

  const specs = useMemo(() => {
    if (!product) return [];

    const staticSpecs = [
      { label: "Category", value: toTitle(product.category || "") },
      { label: "Brand", value: product.brand || "-" },
      { label: "Gender", value: toTitle(product.gender || "Unisex") },
      {
        label: "Rating",
        value: `${Number(product.rating || 0).toFixed(1)} / 5`,
      },
      { label: "Reviews", value: String(product.numReviews || 0) },
    ];

    const attributeSpecs = Object.entries(product.attributes || {}).map(
      ([key, value]) => ({
        label: toTitle(key),
        value,
      }),
    );

    return [...staticSpecs, ...attributeSpecs];
  }, [product]);

  const runMemberAction = async (intent) => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: { pathname: `/product/${product.slug || product._id}` },
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

        setActionMessage("Saved to wishlist.");
        window.dispatchEvent(new Event("vajra-wishlist-changed"));
      } else {
        const variantSku = selectedVariant?.sku || product.variants?.[0]?.sku;

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
            quantity,
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

        setActionMessage(`Added ${quantity} item(s) to cart.`);
      }
    } catch (actionError) {
      setActionMessage(actionError.message || "Action failed");
    }

    setTimeout(() => setActionMessage(""), 2400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#edf2ef] via-[#edf3f2] to-[#e7eef4]">
        <Navbar />
        <main className="mx-auto max-w-[1360px] px-4 pb-20 pt-24 md:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-[520px] animate-pulse rounded-4xl bg-white/80" />
            <div className="h-[520px] animate-pulse rounded-4xl bg-white/80" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#edf2ef] via-[#edf3f2] to-[#e7eef4]">
        <Navbar />
        <main className="mx-auto max-w-[900px] px-4 pb-20 pt-24 md:px-6 lg:px-8">
          <div className="rounded-4xl border border-red-200 bg-white px-6 py-10 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-500">
              Product unavailable
            </p>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              {error || "Could not load product."}
            </h1>
            <button
              onClick={() => navigate("/shop")}
              className="mt-6 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-400 hover:text-gray-900"
            >
              Back To Shop
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#edf2ef] via-[#edf3f2] to-[#e7eef4]">
      <Navbar />

      <main className="mx-auto max-w-[1360px] px-4 pb-20 pt-22 md:px-6 lg:px-8">
        <section className="mb-4 rounded-3xl border border-white/85 bg-white/84 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-[#d6dfd8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2c5b55]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <span className="hidden md:inline">/</span>
              <button
                onClick={() => navigate("/")}
                className="hidden text-xs hover:underline md:inline"
              >
                Home
              </button>
              <span className="hidden md:inline">/</span>
              <button
                onClick={() =>
                  navigate(
                    `/shop?keyword=${encodeURIComponent(product.category || "")}`,
                  )
                }
                className="hidden text-xs capitalize hover:underline md:inline"
              >
                {product.category}
              </button>
            </div>

            <span className="rounded-full border border-[#d8e4dc] bg-[#f3f8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#24524b]">
              {toTitle(product.category)}
            </span>
          </div>
        </section>

        {actionMessage && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {actionMessage}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-3 rounded-4xl border border-white/80 bg-white/92 p-4 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-5">
            <div className="overflow-hidden rounded-3xl bg-linear-to-br from-[#f2f6f3] to-[#e9eff3]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-[420px] w-full object-cover md:h-[520px]"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-sm text-gray-400 md:h-[520px]">
                  No image
                </div>
              )}
            </div>

            {imageGallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2 md:grid-cols-7">
                {imageGallery.map((image) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-2xl border bg-white ${selectedImage === image ? "border-[#2f635c] ring-2 ring-[#d9e9e1]" : "border-[#dbe5dd]"}`}
                  >
                    <img
                      src={image}
                      alt="Preview"
                      className="h-16 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <section className="rounded-4xl border border-white/80 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-gray-500">
                <span>{product.brand}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>{toTitle(product.gender || "Unisex")}</span>
              </div>

              <h1 className="mt-3 text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base md:leading-7">
                {product.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-[#eff5f1] px-3 py-1 text-sm font-semibold text-[#254f4a]">
                  <Star className="h-4 w-4 fill-current" />
                  {Number(product.rating || 0).toFixed(1)}
                </div>
                <span className="text-sm text-gray-500">
                  {product.numReviews || 0} reviews
                </span>
                {product.isFeatured && (
                  <span className="rounded-full border border-[#d4e2da] bg-[#f3f8f4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#24524b]">
                    Featured
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-4xl border border-white/80 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Price
                  </p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    ₹{currentPrice}
                  </p>
                </div>
                {discount > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 line-through">
                      ₹{listPrice}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {discount}% off
                    </p>
                  </div>
                )}
              </div>

              {optionsMeta.length > 0 && (
                <div className="mt-5 space-y-4">
                  {optionsMeta.map((group) => (
                    <div key={group.key}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value) => (
                          <button
                            key={`${group.key}:${value}`}
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [group.key]: value,
                              }))
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                              selectedOptions[group.key] === value
                                ? "border-[#24524b] bg-[#24524b] text-white"
                                : "border-[#d4ded7] bg-white text-gray-700 hover:border-[#24524b]"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  Qty
                </label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(stock, 1)}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          Number(event.target.value || 1),
                          Math.max(stock, 1),
                        ),
                      ),
                    )
                  }
                  className="w-20 rounded-xl border border-[#d7e2da] bg-[#f9fcfa] px-3 py-1.5 text-sm"
                />
                <span
                  className={`text-sm ${stock > 0 ? "text-emerald-700" : "text-red-600"}`}
                >
                  {stock > 0 ? `${stock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  onClick={() => runMemberAction("wishlist")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d0dbd4] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 transition hover:border-lime-400 hover:bg-lime-50"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </button>
                <button
                  onClick={() => runMemberAction("cart")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d0dbd4] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 transition hover:border-lime-400 hover:bg-lime-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add Cart
                </button>
                <button
                  onClick={() => runMemberAction("buy")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-lime-400 hover:text-gray-900"
                >
                  Buy Now
                </button>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Truck,
                  title: "Fast Dispatch",
                  text: "Quick processing with reliable delivery windows.",
                },
                {
                  icon: ShieldCheck,
                  title: "Quality Checked",
                  text: "Every product is screened for consistency and quality.",
                },
                {
                  icon: CheckCircle2,
                  title: "Easy Returns",
                  text: "Simple return initiation from your orders dashboard.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/80 bg-white/88 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
                >
                  <item.icon className="h-4 w-4 text-[#23554f]" />
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </section>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-4xl border border-white/80 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#24625c]">
              Product Description
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-700 md:text-base">
              {product.description}
            </p>
          </div>

          <div className="rounded-4xl border border-white/80 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#24625c]">
              Specifications
            </p>
            <div className="mt-3 grid gap-2">
              {specs.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[130px_1fr] gap-3 rounded-2xl bg-[#f6faf7] px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-gray-700">
                    {item.label}
                  </span>
                  <span className="text-gray-600">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#24625c]">
                  You May Also Like
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  Similar picks in this category
                </h2>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/shop?keyword=${encodeURIComponent(product.category || "")}`,
                  )
                }
                className="rounded-full border border-[#d4dfd8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#274b46]"
              >
                Explore More
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <button
                  key={item._id}
                  onClick={() => navigate(`/product/${item.slug || item._id}`)}
                  className="group overflow-hidden rounded-3xl border border-white/80 bg-white/92 text-left shadow-[0_14px_46px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_58px_rgba(15,23,42,0.14)]"
                >
                  <div className="aspect-[4/4.2] overflow-hidden bg-gray-100">
                    {getProductImage(item) ? (
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="truncate text-xs uppercase tracking-[0.14em] text-gray-500">
                      {item.brand}
                    </p>
                    <h3 className="min-h-12 text-base font-semibold leading-6 text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{item.minPrice}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Number(item.rating || 0).toFixed(1)} rating
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductDetails;
