import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
// import { UserContext } from "../UserProvider";
import { useNavigate } from "react-router-dom";

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const stripePromise = loadStripe(
  "pk_test_51QirepCM0GuCD7Ys3aoxz7HXWHVe4puQ3VKg9Qik7BplEaGWrkjOHvqXsxFfBmYIlBseebdqe73ZgKitr96mluiX00Hjbh9yII"
);

const SUBSCRIPTION_PLANS = {
  gold: {
    name: "Gold Plan",
    price: 1000,
    features: ["You can apply for unlimited internships in a month."],
    gradient: "from-yellow-600 via-yellow-400 to-yellow-300",
    priceId: "price_1QivmTCM0GuCD7YsmGcrTE0A", // Replace with your Stripe price ID
  },
  silver: {
    name: "Silver Plan",
    price: 500,
    features: ["You can apply for 5 internships in a month."],
    gradient: "from-gray-600 via-gray-400 to-gray-300",
    priceId: "price_1QivrsCM0GuCD7Ysd8QNMlSC", // Replace with your Stripe price ID
  },
  bronze: {
    name: "Bronze Plan",
    price: 300,
    features: ["You can apply for 3 internships in a month."],
    gradient: "from-orange-600 via-orange-400 to-orange-300",
    priceId: "price_1QivurCM0GuCD7YsIff8iewB", // Replace with your Stripe price ID
  },
  free: {
    name: "Free Plan",
    price: 0,
    features: ["You can apply for 1 internship in a month."],
    gradient: "from-green-600 via-green-400 to-green-300",
    priceId: null,
  },
};

function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUserPlan = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User ID not found. Please log in again.");
        navigate("/login"); // Redirect if userId is not in localStorage
        return;
      }

      setLoading(true);
      try {
        // Fetching user plan with userId from localStorage
        const response = await fetch("https://intern-area-backned.onrender.com/api/updatePlan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }), // Send userId in body
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user plan.");
        }

        const data = await response.json();
        setCurrentPlan(data.subscription?.plan || "free");
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(err.message || "An unexpected error occurred");
        setCurrentPlan("free");
      } finally {
        setLoading(false);
      }
    };
    fetchUserPlan();
  }, [navigate]); // Trigger the effect when the component mounts

  const handleSubscribe = async (planId, planName) => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (planName === "free") {
        const response = await fetch(
          "https://intern-area-backned.onrender.com/api/subscription/downgrade",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Properly formatted Bearer token
            },
          }
        );

        if (!response.ok) throw new Error("Failed to downgrade plan");
        window.location.reload();
        return;
      }

      const stripe = await stripePromise;
      const response = await fetch(
        "https://intern-area-backned.onrender.com/api/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Properly formatted Bearer token
          },
          body: JSON.stringify({
            priceId: planId,
            planName,
          }),
        }
      );
      // alert("in fronted after api call");

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      if (err.message === "Invalid token") {
        /* localStorage.removeItem("token"); */ // Clear invalid token
        navigate("/login"); // Redirect to login
        return;
      }
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-10 max-w-7xl mx-auto px-4">
      <div className="flex justify-center">
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-bold text-center">Choose Your Plan</h1>
          <p className="text-center text-gray-500 mt-5">
            Select the perfect plan for your needs. All plans include a 30-day
            free trial.
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <div key={key} className="flex justify-center">
            <div
              className={`shadow-lg rounded-lg p-6 w-full my-5 bg-gradient-to-b ${plan.gradient}`}
            >
              <h2 className="text-3xl font-bold text-center mt-4">
                {plan.name}
              </h2>
              <div className="text-center mt-4">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span className="text-gray-800">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => handleSubscribe(plan.priceId, key)}
                  disabled={loading || currentPlan === key}
                  className={`
                    px-8 py-3 rounded-md text-lg font-semibold
                    ${
                      currentPlan === key
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-black text-white hover:bg-opacity-80"
                    }
                    transition duration-150
                  `}
                >
                  {loading
                    ? "Processing..."
                    : currentPlan === key
                    ? "Current Plan"
                    : plan.price === 0
                    ? "Switch to Free"
                    : "Subscribe"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-gray-500">
        <p>All paid plans include a 30-day free trial. Cancel anytime.</p>
        <p className="mt-2">Need help choosing? Contact our support team.</p>
      </div>
    </div>
  );
}

export default Subscription;
