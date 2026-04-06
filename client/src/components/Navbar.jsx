import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Settings,
  Headphones,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const getSuggestionImage = (suggestion) =>
  suggestion.images?.[0] || suggestion.variants?.[0]?.images?.[0] || "";

const Navbar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const requestIdRef = useRef(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, logout } = useAuth();
  const isHomePage = location.pathname === "/";

  const navShellClass = isHomePage
    ? "absolute left-0 right-0 top-0 z-50"
    : "sticky left-0 right-0 top-0 z-50 border-b border-[#d7e2da] bg-[#eff3ee]/92 backdrop-blur-xl";

  const logoClass = isHomePage
    ? "text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.9)] [text-shadow:2px_2px_4px_rgb(0_0_0/80%)] md:text-3xl"
    : "text-2xl font-bold text-[#0f2d2c] md:text-3xl";

  const iconWrapClass = isHomePage
    ? "p-2.5 bg-black/30 hover:bg-white backdrop-blur-sm rounded-full transition-all group relative shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_10px_rgba(163,230,53,0.8)] border border-white/20"
    : "p-2.5 bg-white/85 hover:bg-white rounded-full transition-all group relative shadow-[0_8px_20px_rgba(15,23,42,0.12)] border border-[#d6dfd8]";

  const iconClass = isHomePage
    ? "w-5 h-5 text-white group-hover:text-[#124b4aff] transition-colors drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]"
    : "w-5 h-5 text-[#314343] group-hover:text-[#124b4a] transition-colors";

  const tooltipClass = isHomePage
    ? "absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
    : "absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#163338] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap";

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const isSearchOpen = showSuggestions;

  const runSearch = async (keyword) => {
    const cleanKeyword = keyword.trim();

    if (!cleanKeyword) {
      setSuggestions([]);
      setSearchError("");
      return;
    }

    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    try {
      setSearchLoading(true);
      setSearchError("");
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(
        `${apiUrl}/api/products/search/suggestions?q=${encodeURIComponent(cleanKeyword)}&limit=8`,
      );
      const payload = await response.json();

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message || "Search temporarily unavailable");
      }

      setSuggestions(payload.suggestions || []);
    } catch (error) {
      if (requestIdRef.current !== currentRequestId) {
        return;
      }
      setSuggestions([]);
      setSearchError(error.message || "Search temporarily unavailable");
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setSearchLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(trimmedQuery);
    }, 260);

    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  useEffect(() => {
    const refreshCounts = async () => {
      if (!isAuthenticated || !token) {
        setWishlistCount(0);
        setCartCount(0);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const headers = { Authorization: `Bearer ${token}` };

        const [wishlistResponse, cartResponse] = await Promise.all([
          fetch(`${apiUrl}/api/wishlist`, { headers }),
          fetch(`${apiUrl}/api/cart`, { headers }),
        ]);

        const wishlistPayload = await wishlistResponse.json();
        const cartPayload = await cartResponse.json();

        if (wishlistResponse.ok) {
          setWishlistCount((wishlistPayload.wishlist || []).length);
        }

        if (cartResponse.ok) {
          const totalCartUnits = (cartPayload.cart || []).reduce(
            (total, item) => total + Number(item.quantity || 0),
            0,
          );
          setCartCount(totalCartUnits);
        }
      } catch {
        // Keep previous badge values when request fails.
      }
    };

    const handleWishlistChanged = () => refreshCounts();
    const handleCartChanged = () => refreshCounts();

    refreshCounts();
    window.addEventListener("vajra-wishlist-changed", handleWishlistChanged);
    window.addEventListener("vajra-cart-changed", handleCartChanged);

    return () => {
      window.removeEventListener(
        "vajra-wishlist-changed",
        handleWishlistChanged,
      );
      window.removeEventListener("vajra-cart-changed", handleCartChanged);
    };
  }, [isAuthenticated, token, location.pathname]);

  const cartBadgeText = cartCount > 99 ? "99+" : String(cartCount);
  const wishlistBadgeText = wishlistCount > 99 ? "99+" : String(wishlistCount);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const insideDesktop = desktopSearchRef.current?.contains(event.target);
      const insideMobile = mobileSearchRef.current?.contains(event.target);

      if (!insideDesktop && !insideMobile) {
        setSearchFocused(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const submitSearch = () => {
    if (!trimmedQuery) {
      return;
    }

    navigate(`/shop?keyword=${encodeURIComponent(trimmedQuery)}`);
    setSearchFocused(false);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

  const applySuggestion = (suggestion) => {
    setQuery(suggestion.name);
    navigate(`/shop?keyword=${encodeURIComponent(suggestion.name)}`);
    setSearchFocused(false);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

  const openProtected = (path) => {
    if (isAuthenticated) {
      navigate(path);
      return;
    }

    navigate("/login", {
      state: {
        from: { pathname: path },
        reason: "auth",
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const renderSearchPanel = (isMobile = false) => {
    const panelClass = isMobile
      ? "mt-3 rounded-3xl"
      : "absolute left-0 right-0 top-[calc(100%+14px)] rounded-3xl";

    return (
      <div
        className={`${panelClass} overflow-hidden border border-white/30 bg-white/95 backdrop-blur-2xl shadow-[0_30px_120px_rgba(3,7,18,0.28)]`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#24625c]">
            <Sparkles className="h-3.5 w-3.5" />
            Live Search
          </div>
          {searchLoading && (
            <div className="text-xs text-gray-500">Searching...</div>
          )}
        </div>

        {searchError ? (
          <div className="px-5 py-4 text-sm text-red-600">{searchError}</div>
        ) : suggestions.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-500">
            {trimmedQuery
              ? "No close matches yet. Try another spelling."
              : "Start typing to see suggestions."}
          </div>
        ) : (
          <div className="max-h-105 overflow-y-auto p-2">
            {suggestions.map((suggestion) => {
              const image = getSuggestionImage(suggestion);

              return (
                <button
                  key={suggestion._id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full rounded-2xl px-3 py-3 text-left transition hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                      {image ? (
                        <img
                          src={image}
                          alt={suggestion.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Search className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {suggestion.name}
                      </p>
                      <p className="truncate text-xs uppercase tracking-[0.14em] text-gray-500">
                        {suggestion.brand} . {suggestion.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{suggestion.minPrice}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Number(suggestion.rating || 0).toFixed(1)} rating
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="border-t border-gray-100 px-4 py-3">
          <button
            onClick={submitSearch}
            className="w-full rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-400 hover:text-gray-900"
          >
            Search for {trimmedQuery || "products"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <nav className={navShellClass}>
      {isSearchOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-md"></div>
      )}

      <div className="relative z-50 mx-auto max-w-full px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Link to="/" className="cursor-pointer">
              <h1 className={logoClass}>
                Vaj
                <span className="text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.8)] [text-shadow:0_0_8px_rgb(163_230_53/60%)]">
                  ra
                </span>
              </h1>
            </Link>
          </div>

          <div className="mx-8 hidden max-w-2xl flex-1 md:flex">
            <div
              ref={desktopSearchRef}
              className={`relative w-full transition-all duration-500 ${
                searchFocused ? "transform scale-105" : ""
              }`}
            >
              <div
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  searchFocused
                    ? "bg-linear-to-r from-lime-400 via-[#24625cff] to-[#003438ff] opacity-20 blur-xl"
                    : isHomePage
                      ? "opacity-0"
                      : "bg-linear-to-r from-[#c8d8c8] via-[#c9d8d4] to-[#c5d2d8] opacity-45 blur-xl"
                }`}
              ></div>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transform transition-all duration-300 ${
                    searchFocused
                      ? "scale-110 text-[#24625cff]"
                      : "text-gray-400"
                  }`}
                >
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Search for products, brands and more..."
                  onFocus={() => {
                    setSearchFocused(true);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      submitSearch();
                    }
                    if (event.key === "Escape") {
                      setSearchFocused(false);
                      setShowSuggestions(false);
                    }
                  }}
                  className={`w-full rounded-full py-3.5 pl-12 pr-14 font-medium text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                    searchFocused
                      ? "bg-white shadow-2xl shadow-lime-400/30 ring-2 ring-lime-400/50"
                      : "bg-white/95 shadow-lg backdrop-blur-xl hover:bg-white hover:shadow-xl"
                  }`}
                />
                <button
                  onClick={submitSearch}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:shadow-lg ${
                    searchFocused
                      ? "bg-linear-to-r from-[#24625cff] via-[#124b4aff] to-[#003438ff] text-white"
                      : "scale-90 bg-gray-200 text-gray-600 opacity-70 hover:scale-100 hover:opacity-100"
                  }`}
                >
                  Search
                </button>
              </div>

              {showSuggestions &&
                (searchFocused || trimmedQuery) &&
                renderSearchPanel(false)}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isHomePage
                  ? "bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20"
                  : "bg-white text-[#243738] hover:bg-[#f6faf7] border border-[#d6dfd8] shadow-[0_6px_14px_rgba(15,23,42,0.1)]"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => navigate("/support")}
                className={iconWrapClass}
                title="Customer Care"
              >
                <Headphones className={iconClass} />
                <span className={tooltipClass}>Support</span>
              </button>

              <button
                onClick={() => openProtected("/wishlist")}
                className={iconWrapClass}
                title="Wishlist"
              >
                <Heart className={iconClass} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  {wishlistBadgeText}
                </span>
                <span className={tooltipClass}>Wishlist</span>
              </button>

              <button
                onClick={() => openProtected("/cart")}
                className={iconWrapClass}
                title="Cart"
              >
                <ShoppingCart className={iconClass} />
                <span className="absolute -top-1 -right-1 bg-lime-400 text-gray-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  {cartBadgeText}
                </span>
                <span className={tooltipClass}>Cart</span>
              </button>

              <button
                onClick={() => openProtected("/settings")}
                className={iconWrapClass}
                title="Settings"
              >
                <Settings className={iconClass} />
                <span className={tooltipClass}>Settings</span>
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => openProtected("/profile")}
                  className={iconWrapClass}
                  title="Profile"
                >
                  <User className={iconClass} />
                  <span className={tooltipClass}>Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    isHomePage
                      ? "border border-white/50 bg-white/20 text-white backdrop-blur-sm hover:bg-white hover:text-[#124b4a]"
                      : "border border-[#d6dfd8] bg-white text-[#1f3434] hover:bg-[#f7faf8]"
                  }`}
                >
                  Login
                </button>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    isHomePage
                      ? "border border-white/50 bg-white/20 text-white backdrop-blur-sm hover:bg-white hover:text-[#124b4a]"
                      : "border border-[#d6dfd8] bg-white text-[#1f3434] hover:bg-[#f7faf8]"
                  }`}
                >
                  Logout
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => openProtected("/cart")}
                className={`p-2 rounded-lg relative border ${
                  isHomePage
                    ? "bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-white/20"
                    : "bg-white text-[#243738] hover:bg-[#f7faf8] shadow-[0_6px_14px_rgba(15,23,42,0.1)] border-[#d6dfd8]"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-lime-400 text-gray-900 text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold text-[10px]">
                  {cartBadgeText}
                </span>
              </button>
              <button
                onClick={() => openProtected("/wishlist")}
                className={`p-2 rounded-lg relative border ${
                  isHomePage
                    ? "bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-white/20"
                    : "bg-white text-[#243738] hover:bg-[#f7faf8] shadow-[0_6px_14px_rgba(15,23,42,0.1)] border-[#d6dfd8]"
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold text-[10px]">
                  {wishlistBadgeText}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div ref={mobileSearchRef} className="md:hidden mt-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search products..."
              onFocus={() => {
                setSearchFocused(true);
                setShowSuggestions(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch();
                }
                if (event.key === "Escape") {
                  setSearchFocused(false);
                  setShowSuggestions(false);
                }
              }}
              className="w-full pl-10 pr-20 py-3 rounded-full bg-white/95 backdrop-blur-xl text-gray-800 text-sm 
                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:bg-white 
                        focus:shadow-xl focus:shadow-lime-400/20 transition-all font-medium shadow-lg"
            />
            <button
              onClick={submitSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-lime-400 hover:bg-lime-500 
                    px-3 py-1.5 rounded-full text-xs font-semibold text-gray-900 transition-all hover:shadow-lg"
            >
              Go
            </button>
          </div>

          {showSuggestions &&
            (searchFocused || trimmedQuery) &&
            renderSearchPanel(true)}
        </div>

        {mobileMenuOpen && (
          <div
            className={`md:hidden mt-4 rounded-2xl p-4 space-y-2 border ${
              isHomePage
                ? "bg-black/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border-white/20"
                : "bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)] border-[#d6dfd8]"
            }`}
          >
            <button
              onClick={() => navigate("/support")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isHomePage
                  ? "hover:bg-white/10 text-white"
                  : "hover:bg-[#f2f7f3] text-[#223739]"
              }`}
            >
              <Headphones className="w-5 h-5" />
              <span>Customer Care</span>
            </button>
            <button
              onClick={() => openProtected("/settings")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isHomePage
                  ? "hover:bg-white/10 text-white"
                  : "hover:bg-[#f2f7f3] text-[#223739]"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => openProtected("/profile")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isHomePage
                  ? "hover:bg-white/10 text-white"
                  : "hover:bg-[#f2f7f3] text-[#223739]"
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isHomePage
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-[#f2f7f3] text-[#223739]"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Login / Register</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isHomePage
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-[#f2f7f3] text-[#223739]"
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
