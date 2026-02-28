import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Settings,
  Headphones,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Link to="/" className="cursor-pointer">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.9)] [text-shadow:2px_2px_4px_rgb(0_0_0/80%)]">
                Vaj
                <span className="text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.8)] [text-shadow:0_0_8px_rgb(163_230_53/60%)]">
                  ra
                </span>
              </h1>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div
              className={`relative w-full transition-all duration-500 ${
                searchFocused ? "transform scale-105" : ""
              }`}
            >
              <div
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  searchFocused
                    ? "bg-linear-to-r from-lime-400 via-[#24625cff] to-[#003438ff] opacity-20 blur-xl"
                    : "opacity-0"
                }`}
              ></div>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                    searchFocused
                      ? "text-[#24625cff] scale-110"
                      : "text-gray-400"
                  }`}
                >
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className={`w-full pl-12 pr-14 py-3.5 rounded-full text-gray-800 placeholder-gray-400 
                            focus:outline-none transition-all duration-300 font-medium
                            ${
                              searchFocused
                                ? "bg-white shadow-2xl shadow-lime-400/30 ring-2 ring-lime-400/50"
                                : "bg-white/95 backdrop-blur-xl shadow-lg hover:bg-white hover:shadow-xl"
                            }`}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <button
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-300
                            ${
                              searchFocused
                                ? "bg-linear-to-r from-[#24625cff] via-[#124b4aff] to-[#003438ff] scale-100 opacity-100"
                                : "bg-gray-200 scale-90 opacity-70 hover:opacity-100 hover:scale-100"
                            }
                            px-4 py-2 rounded-full text-sm font-semibold
                            ${searchFocused ? "text-white" : "text-gray-600"}
                            hover:shadow-lg`}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="md:hidden p-2 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-lg transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
              ) : (
                <Menu className="w-6 h-6 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => navigate("/support")}
                className="p-2.5 bg-black/30 hover:bg-white backdrop-blur-sm rounded-full transition-all group relative shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_10px_rgba(163,230,53,0.8)] border border-white/20"
                title="Customer Care"
              >
                <Headphones className="w-5 h-5 text-white group-hover:text-[#124b4aff] transition-colors drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Support
                </span>
              </button>

              <button
                onClick={() => navigate("/wishlist")}
                className="p-2.5 bg-black/30 hover:bg-white backdrop-blur-sm rounded-full transition-all group relative shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_10px_rgba(163,230,53,0.8)] border border-white/20"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 text-white group-hover:text-[#124b4aff] transition-colors drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  3
                </span>
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Wishlist
                </span>
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="p-2.5 bg-black/30 hover:bg-white backdrop-blur-sm rounded-full transition-all group relative shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_10px_rgba(163,230,53,0.8)] border border-white/20"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5 text-white group-hover:text-[#124b4aff] transition-colors drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
                <span className="absolute -top-1 -right-1 bg-lime-400 text-gray-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  5
                </span>
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Cart
                </span>
              </button>

              <button
                onClick={() => navigate("/settings")}
                className="p-2.5 bg-black/30 hover:bg-white backdrop-blur-sm rounded-full transition-all group relative shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_10px_rgba(163,230,53,0.8)] border border-white/20"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-white group-hover:text-[#124b4aff] transition-colors drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Settings
                </span>
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="p-2.5 bg-black/30 hover:bg-white backdrop-blur-sm rounded-full transition-all group relative shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_10px_rgba(163,230,53,0.8)] border border-white/20"
                title="Profile"
              >
                <User className="w-5 h-5 text-white group-hover:text-[#124b4aff] transition-colors drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Profile
                </span>
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => navigate("/cart")}
                className="p-2 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-lg relative shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20"
              >
                <ShoppingCart className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
                <span className="absolute -top-1 -right-1 bg-lime-400 text-gray-900 text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold text-[10px]">
                  5
                </span>
              </button>
              <button
                onClick={() => navigate("/wishlist")}
                className="p-2 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-lg relative shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20"
              >
                <Heart className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold text-[10px]">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden mt-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-20 py-3 rounded-full bg-white/95 backdrop-blur-xl text-gray-800 text-sm 
                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:bg-white 
                        focus:shadow-xl focus:shadow-lime-400/20 transition-all font-medium shadow-lg"
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-lime-400 hover:bg-lime-500 
                    px-3 py-1.5 rounded-full text-xs font-semibold text-gray-900 transition-all hover:shadow-lg"
            >
              Go
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-black/30 backdrop-blur-xl rounded-2xl p-4 space-y-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20">
            <button
              onClick={() => navigate("/support")}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <Headphones className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] [text-shadow:2px_2px_4px_rgb(0_0_0_/80%)]">
                Customer Care
              </span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <Settings className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] [text-shadow:2px_2px_4px_rgb(0_0_0_/80%)]">
                Settings
              </span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <User className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] filter:[drop-shadow(0_2px_4px_rgb(0_0_0))]" />
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] [text-shadow:2px_2px_4px_rgb(0_0_0_/80%)]">
                Profile
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
