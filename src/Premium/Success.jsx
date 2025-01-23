import React from "react";

function SubscriptionSuccess() {
  return (
    <div className="flex flex-col items-center justify-center my-20 py-10 bg-gray-100 rounded-lg shadow-lg max-w-lg mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Subscription <span className="text-green-600">Successful!</span>
      </h1>
      <p className="text-gray-700 text-center">
        Check your email for subscription and payment details.
      </p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-300"
      >
        Go to Homepage
      </a>
    </div>
  );
}

export default SubscriptionSuccess;
