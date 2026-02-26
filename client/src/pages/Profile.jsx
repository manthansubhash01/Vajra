import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Sparkles,
  UserRound,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const toTitle = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const statCards = [
  {
    key: "cartCount",
    label: "Cart Items",
    icon: ShoppingCart,
    accent: "bg-[#eef6f2] text-[#21524c]",
  },
  {
    key: "wishlistCount",
    label: "Wishlist",
    icon: Heart,
    accent: "bg-[#fff1f2] text-[#be123c]",
  },
  {
    key: "orderCount",
    label: "Orders",
    icon: Package,
    accent: "bg-[#eff6ff] text-[#1d4ed8]",
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const { token, user: authUser, interests } = useAuth();

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({
    cartCount: 0,
    wishlistCount: 0,
    orderCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError("");

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResult, wishlistResult, cartResult, ordersResult] =
          await Promise.allSettled([
            fetch(`${apiUrl}/api/profile`, { headers }),
            fetch(`${apiUrl}/api/wishlist`, { headers }),
            fetch(`${apiUrl}/api/cart`, { headers }),
            fetch(`${apiUrl}/api/orders`, { headers }),
          ]);

        if (profileResult.status !== "fulfilled") {
          throw new Error("Failed to load profile");
        }

        const profileResponse = profileResult.value;
        const profilePayload = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profilePayload.message || "Failed to load profile");
        }

        setProfile(profilePayload.user || null);

        if (wishlistResult.status === "fulfilled") {
          const response = wishlistResult.value;
          const payload = await response.json();
          if (response.ok) {
            setSummary((prev) => ({
              ...prev,
              wishlistCount: (payload.wishlist || []).length,
            }));
          }
        }

        if (cartResult.status === "fulfilled") {
          const response = cartResult.value;
          const payload = await response.json();
          if (response.ok) {
            setSummary((prev) => ({
              ...prev,
              cartCount: (payload.cart || []).reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              ),
            }));
          }
        }

        if (ordersResult.status === "fulfilled") {
          const response = ordersResult.value;
          const payload = await response.json();
          if (response.ok) {
            setSummary((prev) => ({
              ...prev,
              orderCount: (payload.orders || []).length,
            }));
          }
        }
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  const userProfile = useMemo(
    () => ({
      name: profile?.name || authUser?.name || "Member",
      email: profile?.email || authUser?.email || "Not available",
      phone: profile?.phone || authUser?.phone || "Not available",
      age: profile?.age || authUser?.age || "-",
      address:
        profile?.address ||
        authUser?.address ||
        [
          authUser?.addressDetails?.addressLine1,
          authUser?.addressDetails?.addressLine2,
          authUser?.addressDetails?.city,
          authUser?.addressDetails?.state,
          authUser?.addressDetails?.country,
          authUser?.addressDetails?.postalCode,
        ]
          .filter(Boolean)
          .join(", ") ||
        "No address saved",
    }),
    [profile, authUser],
  );

  const preferenceGroups = [
    {
      label: "Nutrition",
      values: interests?.diet || [],
    },
    {
      label: "Goals",
      values: interests?.goals || [],
    },
    {
      label: "Training Style",
      values: interests?.styles || [],
    },
    {
      label: "Budget",
      values: interests?.budget ? [toTitle(interests.budget)] : [],
    },
  ];

  const initials = userProfile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#edf2ef] via-[#edf3f2] to-[#e7eef4]">
        <Navbar />
        <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-22 md:px-6 lg:px-8">
          <div className="h-42 animate-pulse rounded-4xl bg-white/90" />
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-96 animate-pulse rounded-4xl bg-white/90" />
            <div className="h-96 animate-pulse rounded-4xl bg-white/90" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#edf2ef] via-[#edf3f2] to-[#e7eef4]">
        <Navbar />
        <main className="mx-auto max-w-[900px] px-4 pb-20 pt-22 md:px-6 lg:px-8">
          <div className="rounded-4xl border border-red-200 bg-white px-6 py-10 text-center shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-500">
              Profile unavailable
            </p>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">{error}</h1>
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

      <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-22 md:px-6 lg:px-8">
        <section className="rounded-[32px] border border-white/85 bg-white/90 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-linear-to-br from-[#17353a] via-[#24524b] to-[#85a947] text-2xl font-bold text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)] md:h-24 md:w-24 md:text-3xl">
                {initials || "V"}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#24625c]">
                  Member Profile
                </p>
                <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-4xl">
                  {userProfile.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                  Your account snapshot, saved details, and personalization
                  signals in one place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              {statCards.map((item) => (
                <div
                  key={item.key}
                  className="rounded-3xl border border-[#dfe8e1] bg-[#f8fbf9] p-4"
                >
                  <div className={`inline-flex rounded-2xl p-2 ${item.accent}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {summary[item.key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <section className="rounded-[30px] border border-white/85 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#24625c]">
                    Account Details
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <button
                  onClick={() => navigate("/settings")}
                  className="rounded-full border border-[#d5dfd8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#274b46]"
                >
                  Manage
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Full Name",
                    value: userProfile.name,
                    icon: UserRound,
                  },
                  {
                    label: "Email",
                    value: userProfile.email,
                    icon: Mail,
                  },
                  {
                    label: "Phone",
                    value: userProfile.phone,
                    icon: Phone,
                  },
                  {
                    label: "Age",
                    value: String(userProfile.age),
                    icon: Sparkles,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-[#e1e8e3] bg-[#f8fbf9] p-4"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      <item.icon className="h-3.5 w-3.5 text-[#23554f]" />
                      {item.label}
                    </div>
                    <p className="mt-3 break-words text-base font-semibold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/85 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[#eef6f2] p-2 text-[#24524b]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#24625c]">
                    Saved Address
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    Default delivery location
                  </h2>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-[#e1e8e3] bg-[#f8fbf9] p-4">
                <p className="text-sm leading-7 text-gray-700">
                  {userProfile.address}
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[30px] border border-white/85 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#f4f7ec] p-2 text-[#55762a]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#24625c]">
                    Personalization
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    Your fitness preferences
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {preferenceGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {group.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.values.length > 0 ? (
                        group.values.map((value) => (
                          <span
                            key={`${group.label}:${value}`}
                            className="rounded-full border border-[#d8e4dc] bg-[#f3f8f4] px-3 py-1.5 text-xs font-semibold text-[#24524b]"
                          >
                            {value}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          Not set yet
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!interests && (
                <button
                  onClick={() =>
                    navigate("/onboarding/interests", {
                      state: { from: { pathname: "/profile" } },
                    })
                  }
                  className="mt-5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-400 hover:text-gray-900"
                >
                  Complete Personalization
                </button>
              )}
            </section>

            <section className="rounded-[30px] border border-white/85 bg-white/92 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#24625c]">
                Quick Access
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Wishlist",
                    description: "See your saved products",
                    action: () => navigate("/wishlist"),
                  },
                  {
                    label: "Cart",
                    description: "Review current picks",
                    action: () => navigate("/cart"),
                  },
                  {
                    label: "Orders",
                    description: "Track previous purchases",
                    action: () => navigate("/orders"),
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="rounded-3xl border border-[#e1e8e3] bg-[#f8fbf9] p-4 text-left transition hover:border-[#c8d8cf] hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
