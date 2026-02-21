import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { register, login } = useAuth();

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildFullAddress = () => {
    const parts = [
      form.addressLine1,
      form.addressLine2,
      form.city,
      form.state,
      form.country,
      form.postalCode,
    ]
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    return parts.join(", ");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const requiredFields = [
      form.name,
      form.email,
      form.password,
      form.age,
      form.phone,
      form.addressLine1,
      form.city,
      form.state,
      form.country,
      form.postalCode,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const fullAddress = buildFullAddress();

      const registerResponse = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          age: Number(form.age),
          phone: form.phone.trim(),
          address: fullAddress,
        }),
      });

      const registerPayload = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerPayload.message || "Unable to register");
      }

      register({
        token: "",
        identity: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          age: Number(form.age),
          address: fullAddress,
          addressDetails: {
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
          },
          gender: form.gender,
        },
      });

      const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          password: form.password,
        }),
      });

      const loginPayload = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(
          loginPayload.message || "Account created. Please login.",
        );
      }

      login({
        token: loginPayload.token,
        identity: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          age: Number(form.age),
          address: fullAddress,
          addressDetails: {
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
          },
          gender: form.gender,
        },
      });

      navigate("/onboarding/interests", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#eef4e8] via-[#f5f6ef] to-[#e8f1f4] px-4 py-14 md:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] md:grid md:grid-cols-[1fr_1.2fr]">
        <section className="bg-linear-to-br from-[#173036] via-[#24625c] to-[#3a7453] p-8 text-white md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">
            Join Vajra
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Create your fitness shopping account in minutes.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/85 md:text-base">
            Guests can browse freely. Members can add to cart, save wishlist,
            place orders, and get recommendations tuned to their fitness
            journey.
          </p>
        </section>

        <section className="p-8 md:p-10">
          <form
            onSubmit={submit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Full Name *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="Email *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Password *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="Phone Number *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              type="number"
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
              placeholder="Age *"
              min="12"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <select
              value={form.gender}
              onChange={(event) => update("gender", event.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="">Gender (optional)</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <input
              value={form.addressLine1}
              onChange={(event) => update("addressLine1", event.target.value)}
              placeholder="Address Line 1 *"
              className="md:col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              value={form.addressLine2}
              onChange={(event) => update("addressLine2", event.target.value)}
              placeholder="Address Line 2 (optional)"
              className="md:col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
              placeholder="City *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              value={form.state}
              onChange={(event) => update("state", event.target.value)}
              placeholder="State / Province *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              value={form.country}
              onChange={(event) => update("country", event.target.value)}
              placeholder="Country *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <input
              value={form.postalCode}
              onChange={(event) => update("postalCode", event.target.value)}
              placeholder="Postal Code *"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />

            {error && (
              <p className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-lime-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#124b4a] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;
