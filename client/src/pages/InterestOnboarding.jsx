import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dietOptions = [
  "Vegetarian",
  "Eggetarian",
  "Non-vegetarian",
  "Vegan",
  "Keto",
  "Balanced diet",
];

const goalOptions = [
  "Weight lifting",
  "Athlete",
  "Calisthenics",
  "General fitness",
  "Fat loss",
  "Muscle gain",
  "Endurance",
];

const styleOptions = [
  "Home workout",
  "Gym training",
  "Outdoor training",
  "Yoga & mobility",
  "Mixed routine",
];

const InterestOnboarding = () => {
  const [diet, setDiet] = useState([]);
  const [goals, setGoals] = useState([]);
  const [styles, setStyles] = useState([]);
  const [budget, setBudget] = useState("mid-range");

  const navigate = useNavigate();
  const location = useLocation();
  const { saveInterests, user } = useAuth();
  const returnPath = location.state?.from?.pathname || "/shop";

  const toggleItem = (collection, setter, value) => {
    setter(
      collection.includes(value)
        ? collection.filter((item) => item !== value)
        : [...collection, value],
    );
  };

  const submit = (event) => {
    event.preventDefault();

    saveInterests({
      diet,
      goals,
      styles,
      budget,
      submittedAt: new Date().toISOString(),
    });

    navigate(returnPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#eef4e8] via-[#f2f4ec] to-[#e2ecef] px-4 py-14 md:px-6">
      <div className="mx-auto max-w-5xl rounded-[34px] border border-white/70 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.14)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#24625c]">
          Personalization Setup
        </p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
          Tell us what matches your routine, {user?.name || "member"}.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          This helps us recommend better products in your first sessions before
          we learn from order and browsing behavior.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Nutrition Preference
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {dietOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleItem(diet, setDiet, option)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    diet.includes(option)
                      ? "border-lime-500 bg-lime-100 text-[#103229]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-lime-400"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Primary Fitness Goals
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {goalOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleItem(goals, setGoals, option)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    goals.includes(option)
                      ? "border-lime-500 bg-lime-100 text-[#103229]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-lime-400"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Training Style
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {styleOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleItem(styles, setStyles, option)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    styles.includes(option)
                      ? "border-lime-500 bg-lime-100 text-[#103229]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-lime-400"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Budget Range
            </h2>
            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="mt-3 w-full max-w-sm rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value="budget">Budget friendly</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-lime-400 hover:text-gray-900"
            >
              Save & Continue
            </button>
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-gray-700 transition hover:border-gray-500"
            >
              Skip For Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterestOnboarding;
