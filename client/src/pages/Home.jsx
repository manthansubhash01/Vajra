import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";

const getProductImage = (product) =>
  product.images?.[0] || product.variants?.[0]?.images?.[0] || "";

const ProductCard = ({ product, onClick }) => {
  const productImage = getProductImage(product);

  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-[28px] border border-white/70 bg-white text-left shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-linear-to-br from-stone-100 via-white to-lime-50">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.25em] text-gray-500">
            Vajra Select
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/10 to-transparent px-4 pb-4 pt-12">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {product.category}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.18em] text-gray-500">
          <span>{product.brand}</span>
          <span>{Number(product.rating || 0).toFixed(1)} / 5</span>
        </div>

        <div>
          <h3 className="min-h-14 text-lg font-semibold leading-7 text-gray-900">
            {product.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
              Starting at
            </p>
            <p className="text-xl font-bold text-gray-900">
              ₹{product.minPrice}
            </p>
          </div>
          <span className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-white transition group-hover:bg-lime-400 group-hover:text-gray-900">
            View More
          </span>
        </div>
      </div>
    </button>
  );
};

const ProductSection = ({ section, navigate }) => {
  const products = section?.products || [];

  if (!section || !products.length) {
    return null;
  }

  return (
    <section className="mt-18 md:mt-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#24625c]">
            {section.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {section.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-gray-600">
            {section.description}
          </p>
        </div>

        <button
          onClick={() => navigate("/shop")}
          className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-lime-400 hover:bg-lime-400"
        >
          Explore Collection
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => navigate(`/product/${product.slug || product._id}`)}
          />
        ))}
      </div>
    </section>
  );
};

const HomeSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
      >
        <div className="aspect-4/5 animate-pulse bg-gray-200" />
        <div className="space-y-3 p-5">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

const Home = () => {
  const [homeData, setHomeData] = useState({
    featured: [],
    sections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/home/feed`);
        const rawBody = await response.text();
        const data = rawBody ? JSON.parse(rawBody) : null;

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Product feed is unavailable. Check that the backend server is running.",
          );
        }

        setHomeData({
          featured: data?.featured || [],
          sections: data?.sections || [],
        });
      } catch (fetchError) {
        console.error("Error fetching home products:", fetchError);
        setError(fetchError.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#eef0eb] text-gray-900">
      <HeroSection />

      <main className="relative z-10 -mt-12 px-4 pb-20 md:-mt-16 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-4xl border border-white/70 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <div className="grid gap-px bg-gray-200 md:grid-cols-4">
              {[
                "Premium product curation",
                "Built for performance routines",
                "Fast-moving bestselling picks",
                "Design-first training essentials",
              ].map((item) => (
                <div
                  key={item}
                  className="bg-white px-6 py-6 text-sm font-medium text-gray-800 md:text-base"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          {homeData.featured.length > 0 && (
            <section className="mt-16 md:mt-20">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#24625c]">
                    Featured Drops
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
                    The strongest mix of form, function, and presence.
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/shop")}
                  className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-lime-400 hover:text-gray-900"
                >
                  Shop Everything
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr_1fr]">
                {homeData.featured.slice(0, 3).map((product, index) => {
                  const productImage = getProductImage(product);

                  return (
                    <button
                      key={product._id}
                      onClick={() =>
                        navigate(`/product/${product.slug || product._id}`)
                      }
                      className={`group relative overflow-hidden rounded-4xl text-left ${index === 0 ? "min-h-130" : "min-h-90"}`}
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-stone-200 via-stone-100 to-lime-100" />
                      {productImage && (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime-300">
                          {product.brand}
                        </p>
                        <h3 className="mt-3 max-w-md text-2xl font-bold leading-tight text-white md:text-3xl">
                          {product.name}
                        </h3>
                        <div className="mt-4 flex items-center justify-between gap-4 text-white/90">
                          <p className="text-lg font-semibold">
                            ₹{product.minPrice}
                          </p>
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.16em] backdrop-blur-sm">
                            Featured
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-16 overflow-hidden rounded-4xl bg-linear-to-r from-[#0f172a] via-[#173036] to-[#24625c] px-6 py-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.18)] md:mt-20 md:px-10 md:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">
                  Vajra Picks
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                  A cleaner storefront for serious training gear.
                </h2>
                <p className="mt-4 text-base leading-7 text-white/75">
                  The home page now rotates products across every category so
                  the first impression feels alive, premium, and worth
                  exploring.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Clothing", value: "Fresh drops" },
                  { label: "Accessories", value: "Grip & carry" },
                  { label: "Equipment", value: "Home gym" },
                  { label: "Supplements", value: "Recovery" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
                  >
                    <p className="text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-white/65">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <section className="mt-18 md:mt-24">
              <HomeSkeleton />
            </section>
          ) : error ? (
            <section className="mt-18 rounded-4xl border border-red-200 bg-white px-6 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:mt-24">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-500">
                Product feed unavailable
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">{error}</h2>
              <p className="mt-3 text-gray-600">
                The hero is still live, but the curated product feed could not
                be loaded right now.
              </p>
            </section>
          ) : (
            homeData.sections.map((section) => (
              <ProductSection
                key={section.key}
                section={section}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
