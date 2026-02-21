import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const reason = location.state?.reason;
  const fromPath = location.state?.from?.pathname;

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.identifier.trim() || !form.password.trim()) {
      setError("Please enter your name or phone and password.");
      return;
    }

    const isPhone = /^[0-9]{8,15}$/.test(form.identifier.trim());

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: form.password,
          ...(isPhone
            ? { phone: form.identifier.trim() }
            : { name: form.identifier.trim() }),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to login");
      }

      login({
        token: payload.token,
        identity: {
          name: isPhone ? "Member" : form.identifier.trim(),
          phone: isPhone ? form.identifier.trim() : "",
        },
      });

      navigate(fromPath || "/onboarding/interests", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f3f4ea] via-[#eef5f0] to-[#e4eef2] px-4 py-14 md:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] md:grid md:grid-cols-2">
        <section className="bg-linear-to-br from-[#0f172a] via-[#14303a] to-[#24625c] p-8 text-white md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">
            Vajra Account
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Sign in to unlock cart, wishlist, and quick checkout.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/85 md:text-base">
            Browse as guest anytime. Login lets you save products, track orders,
            and get personalized recommendations.
          </p>

          {reason === "auth" && (
            <div className="mt-8 rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4 text-sm text-lime-100">
              Please login or register to continue with your action.
            </div>
          )}
        </section>

        <section className="p-8 md:p-10">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Name or Phone
              </label>
              <input
                value={form.identifier}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    identifier: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Enter your name or phone"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-lime-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            New here?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#124b4a] hover:underline"
            >
              Create account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
