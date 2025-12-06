"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

// Private module-level variables to cache Stripe
let _stripeInstance: any = null;
let _stripePromise: Promise<any> | null = null;
let _initializationInProgress = false;

/**
 * Hook for using Stripe in functional components
 * This is the recommended way to use Stripe in React components
 */
function useStripe() {
  const [stripe, setStripe] = useState<any>(_stripeInstance);
  const [isLoading, setIsLoading] = useState(!_stripeInstance);
  const [error, setError] = useState<Error | null>(null);
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    if (!publishableKey) {
      setError(new Error("Missing Stripe publishable key"));
      setIsLoading(false);
      return;
    }
    // If we already have the Stripe instance cached, use it
    if (_stripeInstance) {
      setStripe(_stripeInstance);
      setIsLoading(false);
      return;
    }

    // If initialization is in progress, wait for the promise to resolve
    if (_initializationInProgress && _stripePromise) {
      _stripePromise
        .then((instance) => {
          _stripeInstance = instance;
          setStripe(instance);
          setIsLoading(false);
        })
        .catch((err) => {
          _stripePromise = null;
          _initializationInProgress = false;
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        });
      return;
    }

    // Initialize Stripe with the publishable key
    try {
      setIsLoading(true);
      _initializationInProgress = true;
      _stripePromise = loadStripe(publishableKey);

      _stripePromise
        .then((instance) => {
          _stripeInstance = instance;
          setStripe(instance);
          setIsLoading(false);
        })
        .catch((err) => {
          _stripePromise = null;
          _initializationInProgress = false;
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        });
    } catch (err) {
      _stripePromise = null;
      _initializationInProgress = false;
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [publishableKey]);

  return {
    stripe,
    isLoading: isLoading,
    error: error,
  };
}

/**
 * Async function to get Stripe instance
 * This can be used in non-hook contexts like event handlers
 * This should only be used when a component using useStripe() is already rendered
 */
const getStripe = async () => {
  // If we already have a Stripe instance, return it
  if (_stripeInstance) {
    return _stripeInstance;
  }

  // If initialization is in progress, return the promise
  if (_initializationInProgress && _stripePromise) {
    return _stripePromise;
  }

  // We can't initialize Stripe without the publishable key
  // At this point, we expect a component using useStripe() to have already
  // initialized Stripe, or be in the process of initializing it
  throw new Error(
    "Stripe is not initialized. Make sure a component using useStripe() has been rendered first."
  );
};

// Default export for backwards compatibility with your existing code
export { getStripe, useStripe };
