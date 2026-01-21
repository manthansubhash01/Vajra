import React from "react";
import Navbar from "../components/Navbar";

const Wishlist = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 px-4 md:px-8 lg:px-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Wishlist</h1>
        <p className="text-gray-600">You have 3 items in your wishlist.</p>
      </div>
    </div>
  );
};

export default Wishlist;
