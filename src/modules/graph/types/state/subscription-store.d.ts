export type SubscriptionState = {
    email: string;
    subscriptionId: string;
    paymentMethodId: string;
    clientSecret: string;
    status: 'idle' | 'processing' | 'success' | 'failed';
  }
  
  export type SubscriptionActions = {
    setEmail: (email: string) => void;
    setSubscriptionId: (subscriptionId: string) => void;
    setPaymentMethodId: (paymentMethodId: string) => void;
    setClientSecret: (clientSecret: string) => void;
    setStatus: (status: SubscriptionState['status']) => void;
    reset: () => void;
  }